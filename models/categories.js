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
    const isCategoryExist = await DB("Categories").select("*").where({ category_id: categoryId }).first();
    return !!isCategoryExist;
  },
  getCategoriesList: async ({ maxResults = 20, sortBy = "author_id", startIndex = 0 }) => {
    return await DB("Categories")
    .select("*", DB("Books_Categories").whereRaw("?? = ??", ["Categories.category_id", "category_id"]).count("*").as("booksCounter"))
    .limit(maxResults)
    .offset(startIndex)
    .orderBy(sortBy);
  },
  getCategoryById: async categoryId => {
    return await DB("Categories").select("*", DB("Books_Categories").whereRaw("?? = ??", ["Categories.category_id", "category_id"]).count("*").as("booksCounter")).first().where({ category_id: categoryId });
  },
  getCategoryByTitle: async title => {
    return await DB("Categories").select("*", DB("Books_Categories").whereRaw("?? = ??", ["Categories.category_id", "category_id"]).count("*").as("booksCounter")).first().where({ title });
  },
  getCategoryByTitlesList: async titlesList => {
    return await DB("Categories").select("*").whereIn("title", titlesList);
  },
  deleteCategory: async categoryId => {
    const category = await DB("Categories").select("*").first().where({ category_id: categoryId });
    
    const allBookCategories = await DB("Books_Categories").select("*").where({ category_id: category.category_id });
    await DB("Books_Categories").delete().whereIn("Books_Categories_id", allBookCategories.map(item => item.Books_Categories_id));
    await DB("Categories").delete().where({ category_id: categoryId });
  },
};

module.exports = model;