const DB = require("../services/db");
const categories = require("./categories");
const authors = require("./author");


const model = {
  createBook: async fields => {
    const [book] = await DB("Books").insert({ ...fields }).returning("*");
    
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
  getBooksList: async ({ maxResults = 20, sortBy = "book_id", startIndex = 0 }) => {
    const books = await DB("Books")
    .select("Books.*", "Categories.title as categoryTitle", "Authors.name as authorName")
    .leftJoin("Books_Categories", "Books_Categories.book_id", "Books.book_id")
    .leftJoin("Categories", "Books_Categories.category_id", "Categories.category_id")
    .leftJoin("Books_Authors", "Books_Authors.book_id", "Books.book_id")
    .leftJoin("Authors", "Books_Authors.author_id", "Authors.author_id")
    .limit(maxResults <= 100 ? maxResults : 100)
    .offset(startIndex)
    .orderBy(sortBy);

    const formattedBooksObj = {};

    books.forEach(book => {
      if (book.book_id in formattedBooksObj) {
        return formattedBooksObj[book.book_id].push(book);
      } 
      formattedBooksObj[book.book_id] = [book];
    });

    const formattedBooksList = Object.keys(formattedBooksObj).map(key => formattedBooksObj[key]);

    

    return formattedBooksList.map(book => book.reduce((memo, categoryEntry) => {
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
    }, {}));
  },
  getBookById: async bookId => {
    const book = await DB("Books")
    .select("Books.*", "Categories.title as categoryTitle", "Authors.name as authorName")
    .leftJoin("Books_Categories", "Books_Categories.book_id", "Books.book_id")
    .leftJoin("Categories", "Books_Categories.category_id", "Categories.category_id")
    .leftJoin("Books_Authors", "Books_Authors.book_id", "Books.book_id")
    .leftJoin("Authors", "Books_Authors.author_id", "Authors.author_id")
    .where("Books.book_id", bookId);

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
  createBookWithCategories: async (bookFields, categoryTitles) => {
    const categoriesList = await categories.getCategoryByTitlesList(categoryTitles);
    const [createdBook] = await DB("Books").insert({ ...bookFields }).returning("*");

    return Promise.all(categoriesList.map(category => {
      return DB("Books_Categories").insert({ book_id: createdBook.book_id, category_id: category.category_id }).returning("*");
    }));
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
      const categoriesList = await categories.getCategoryByTitlesList(bookFields.categories);
      const allBookCategories = await DB("Books_Categories").select().where({ book_id: bookFields.id });

      const oldCategories = allBookCategories.filter(category => !categoriesList.some(item => category.category_id === item.category_id));
      const newCategories = categoriesList.filter(category => !allBookCategories.some(item => category.category_id === item.category_id));

      await DB("Books_Categories").delete().whereIn("Books_Categories_id", oldCategories.map(item => item.Books_Categories_id));
    
      Promise.all(newCategories.map(async (category) => {
        return DB("Books_Categories").insert({ book_id: bookFields.id, category_id: category.category_id }).returning("*");
      }));
    }

    if (bookFields.authors) {
      const authorsList = await authors.getAuthorsByName(bookFields.authors);
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

