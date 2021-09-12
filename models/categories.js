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
  getCategoriesList: async () => {
    return await DB("Books_Categories").select("*");
  },
  getCategoryByTitlesList: async titlesList => {
    return await DB("Categories").select("*").whereIn("title", titlesList);
  },
};

module.exports = model;