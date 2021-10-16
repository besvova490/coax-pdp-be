const DB = require("../services/db");


const model = {
  createCategory: async title => {
    const [category] = await DB("Categories").insert({ title }).returning("*");

    return category;
  },
  checkIfExist: async title => {
    const isCategoryExist = await DB("Categories").select("*").where({ title }).first();
    return !!isCategoryExist;
  },
  checkIfExistById: async categoryId => {
    const isCategoryExist = await DB("Categories").select("*").where({ id: categoryId }).first();
    return !!isCategoryExist;
  },
  getCategoriesList: async ({ maxResults = 20, sortBy = "id", startIndex = 0, withoutPagination }) => {
    const counter = await DB("Categories").count().first();

    if (withoutPagination) {
      const allCategories = await DB("Categories")
      .select("*", DB("Books_Categories").whereRaw("?? = ??", ["Categories.id", "category_id"]).count("*").as("booksCounter"));

      return { categories: allCategories, counter: +counter.count };
    }
    
    const calegoriesList = await DB("Categories")
    .select("*", DB("Books_Categories").whereRaw("?? = ??", ["Categories.id", "category_id"]).count("*").as("booksCounter"))
    .limit(maxResults <= 40 ? maxResults : 40)
    .offset(startIndex)
    .orderBy(sortBy);

    return { categories: calegoriesList, ...counter };
  },
  getCategoryById: async categoryId => {
    return await DB("Categories").select("*", DB("Books_Categories").whereRaw("?? = ??", ["Categories.id", "category_id"]).count("*").as("booksCounter")).first().where({ category_id: categoryId });
  },
  getCategoryByTitle: async title => {
    return await DB("Categories").select("*", DB("Books_Categories").whereRaw("?? = ??", ["Categories.id", "category_id"]).count("*").as("booksCounter")).first().where({ title });
  },
  getCategoryByTitlesList: async titlesList => {
    return await DB("Categories").select("*").whereIn("title", titlesList);
  },
  deleteCategory: async categoryId => {
    const category = await DB("Categories").select("*").first().where({ id: categoryId });
    
    const allBookCategories = await DB("Books_Categories").select("*").where({ category_id: category.id });
    await DB("Books_Categories").delete().whereIn("Books_Categories_id", allBookCategories.map(item => item.Books_Categories_id));
    await DB("Categories").delete().where({ id: categoryId });
  },
};

module.exports = model;