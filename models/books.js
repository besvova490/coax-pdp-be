const DB = require("../services/db");
const categoriesModel = require("./categories");
const authorsModel = require("./author");


const model = {
  createBook: async (fields, { categories, authors }) => {
    const [book] = await DB("Books").insert({ ...fields }).returning("*");

    if (categories) {
      const categoriesList = await categoriesModel.getCategoryByTitlesList(categories);
      Promise.all(categoriesList.map(async (category) => {
        return DB("Books_Categories").insert({ book_id: book.book_id, category_id: category.category_id }).returning("*");
      }));
    }

    if (authors) {
      const authorsList = await authorsModel.getAuthorsByName(authors);
      Promise.all(authorsList.map(async (author) => {
        return DB("Books_Authors").insert({ book_id: book.book_id, author_id: author.author_id }).returning("*");
      }));
    }
    
    return book; 
  },
  attachBookCategory: async ({ bookId, categoryId }) => {
    const [result] = await DB("Books_Categories").insert({ book_id: bookId, category_id: categoryId }).returning("*");

    return result;
  },
  checkIfBookExist: async bookId => {
    const book = await DB("Books").select().first().where({ book_id: bookId });

    return !!book;
  },
  getBooksList: async ({ maxResults = 20, sortBy = "id", startIndex = 0 }) => {
    const counter = await DB("Books").count();
    const books = await DB("Books")
    .limit(maxResults <= 100 ? maxResults : 100)
    .offset(startIndex)
    .orderBy(sortBy, "desc");

    return { books: books, counter };
  },

  getByCategoryTitle: async categoryTitle => {
    const category = await categoriesModel.getCategoryByTitle(categoryTitle);

    const books = await DB("Books")
    .select("Books.*")
    .leftJoin("Books_Categories", "Books_Categories.book_id", "Books.id")
    .where("Books_Categories.category_id", category.id);
  
    return { books: books, counter: books.length };
  },
  getBookById: async bookId => {
    const book = await DB("Books")
    .select("Books.*", "Categories.title as categoryTitle", "Authors.name as authorName")
    .leftJoin("Books_Categories", "Books_Categories.book_id", "Books.id")
    .leftJoin("Categories", "Books_Categories.category_id", "Categories.id")
    .leftJoin("Books_Authors", "Books_Authors.book_id", "Books.id")
    .leftJoin("Authors", "Books_Authors.author_id", "Authors.id")
    .where("Books.id", bookId);

    return book.reduce((memo, categoryEntry) => {
      if (!memo.title){
        memo = {...categoryEntry};
      } 
      if (!memo.categories) {
        memo.categories = [];
      }
      if (!memo.authors) {
        memo.authors = [];
      }
      if (!memo.categories.includes(categoryEntry.categoryTitle) && categoryEntry.categoryTitle) {
        memo.categories.push(categoryEntry.categoryTitle);
      }
      if (!memo.authors.includes(categoryEntry.authorName) && categoryEntry.authorName) {
        memo.authors.push(categoryEntry.authorName);
      }
      return memo;
    }, {});
  },
  updateBook: async bookFields => {
    const keysBlackList = ["id", "categories", "authors"];

    const filteredFields = Object.keys(bookFields)
    .filter(key => !keysBlackList.includes(key))
    .reduce((obj, key) => {
      obj[key] = bookFields[key];
      return obj;
    }, {});
  

    if (bookFields.categories) {
      const categoriesList = await categoriesModel.getCategoryByTitlesList(bookFields.categories);
      const allBookCategories = await DB("Books_Categories").select().where({ book_id: bookFields.id });

      const oldCategories = allBookCategories.filter(category => !categoriesList.some(item => category.category_id === item.category_id));
      const newCategories = categoriesList.filter(category => !allBookCategories.some(item => category.category_id === item.category_id));

      await DB("Books_Categories").delete().whereIn("Books_Categories_id", oldCategories.map(item => item.Books_Categories_id));
    
      Promise.all(newCategories.map(async (category) => {
        return DB("Books_Categories").insert({ book_id: bookFields.id, category_id: category.category_id }).returning("*");
      }));
    }

    if (bookFields.authors) {
      const authorsList = await authorsModel.getAuthorsByName(bookFields.authors);
      const allAuthorBooks = await DB("Books_Authors").select().where({ book_id: bookFields.id });

      const oldAuthors = allAuthorBooks.filter(author => !authorsList.some(item => author.author_id === item.author_id));
      const newAuthors = authorsList.filter(author => !allAuthorBooks.some(item => author.author_id === item.author_id));

      await DB("Books_Authors").delete().whereIn("book_author_id", oldAuthors.map(item => item.book_author_id));

      Promise.all(newAuthors.map(async (author) => {
        return DB("Books_Authors").insert({ book_id: bookFields.id, author_id: author.author_id }).returning("*");
      }));
    }

    if (Object.keys(filteredFields).length) {
      const [result] = await DB("Books").update({
        ...filteredFields
      }).where({ book_id: bookFields.id }).returning("*");
  
      return result;
    }
  },
  deleteBook: async bookId => {
    const allBookCategories = await DB("Books_Categories").select().where({ book_id: bookId });
    await DB("Books_Categories").delete().whereIn("Books_Categories_id", allBookCategories.map(item => item.Books_Categories_id));

    const [result] = await DB("Books").delete().where({ book_id: bookId }).returning("*");

    return result;
  },
};

module.exports = model;

