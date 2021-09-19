const DB = require("../services/db");
const books = require("./books");


const model = {
  createAuthor: async fields => {
    const [author] = await DB("Authors").insert({ ...fields }).returning("*");

    return author;
  },
  getAuthorsList: async ({ maxResults = 20, sortBy = "author_id", startIndex = 0 }) => {
    return await DB("Authors")
    .limit(maxResults <= 100 ? maxResults : 100)
    .offset(startIndex)
    .orderBy(sortBy);
  },
  getById: async authorId => {
    return await DB("Authors").where({ author_id: authorId }).first();
  },
  checkIfExist: async name => {
    const author = await DB("Authors").where({ name: name }).first();

    return !!author;
  },
  getAuthorsByName: async namesList => {
    return await DB("Authors").select("*").whereIn("name", namesList);
  },
  addBook: async (bookId, authorId) => {
    return await DB("Books_Authors").insert({ book_id: bookId, author_id: authorId });
  },
  updateAuthor: async (fields, id) => {
    const [author] = await DB("Authors").update({ ...fields }).where({ author_id: id }).returning("*");

    return author;
  }
};

module.exports = model;