const { Router } = require("express");

const DB = require("../services/db");

const middleware = require("../middleware/validation");
const schemas = require("../schemas/auth");

const booksRouter = Router();


booksRouter.get("/", async(req, res) => {
  try {
    const { maxResults = 20, sortBy = "id", startIndex = 0 } = req.query;
    const books = await DB("Books").limit(maxResults <= 100 ? maxResults : 100).offset(startIndex).orderBy(sortBy);

    res.status(200).json({ books });
  } catch(e) {
    res.status(500).json({ msg: e.message || "Internet server error" }); 
  }
});

booksRouter.get("/:bookId", async(req, res) => {
  try {
    const { bookId } = req.params
    const book = await DB("Books").where({ book_id: bookId }).first();

    if (!book) return res.status(404).json({ msg: "Book not found" });

    res.status(200).json({ ...book });
  } catch(e) {
    res.status(500).json({ msg: e.message || "Internet server error" }); 
  }
});

booksRouter.patch("/", middleware(schemas.loginPost, "body"), async (req, res) => {
  try {
    const {
      title,
      description,
      amount,
      printType,
      shortDescription,
      publisher,
      publishedDate,
      printType,
      categories,
      thumbnailLink,
      previewLink,
      language,
      amount,
      discount,
      pageCount,
    } = req.body;

    const isBookExist = await DB("Books").select().first().where({ title });
    if (isBookExist) return res.status(400).json({ msg: `Book with such title '${title} already exist'` })

    const book = await DB("Books").insert({
      title,
      description,
      amount,
      printType,
      shortDescription,
      publisher,
      publishedDate,
      printType,
      categories,
      thumbnailLink,
      previewLink,
      language,
      amount,
      discount,
      pageCount,
    });

    res.status(202).json({ msg: "New book has been created" });
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});


module.exports = booksRouter;
