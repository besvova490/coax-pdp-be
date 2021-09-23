const { Router } = require("express");

const DB = require("../services/db");

const middleware = require("../middleware/validation");
const schemas = require("../schemas/book");
const books = require("../models/books");

const booksRouter = Router();


booksRouter.get("/", async(req, res) => {
  try {
    const { maxResults = 20, sortBy = "book_id", startIndex = 0 } = req.query;
    const booksList = await books.getBooksList({ maxResults, sortBy, startIndex });

    res.status(200).json({ books: booksList });
  } catch(e) {
    res.status(500).json({ msg: e.message || "Internet server error" }); 
  }
});

booksRouter.get("/:bookId", async(req, res) => {
  try {
    const { bookId } = req.params
    const book = await books.getBookById(bookId);

    if (!book) return res.status(404).json({ msg: "Book not found" });

    res.status(200).json({ ...book });
  } catch(e) {
    res.status(500).json({ msg: e.message || "Internet server error" }); 
  }
});

booksRouter.post("/", middleware(schemas.bookPost, "body"), async (req, res) => {
  try {
    const {
      title,
      description,
      amount,
      printType,
      shortDescription,
      publisher,
      publishedDate,
      authors,
      categories,
      thumbnailLink,
      previewLink,
      language,
      discount,
      pageCount,
    } = req.body;

    const isBookExist = await DB("Books").select().first().where({ title });
    if (isBookExist) return res.status(400).json({ msg: `Book with such title '${title} already exist'` })

    const book = books.createBook({
      title,
      description,
      amount,
      printType,
      shortDescription,
      publisher,
      publishedDate,
      thumbnailLink,
      previewLink,
      language,
      discount,
      pageCount,
    }, { authors, categories});

    res.status(202).json({ msg: "New book has been created", book });
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

booksRouter.put("/:bookId", async (req, res) => {
  try {
    const { bookId } = req.params
    const checkIfBookExist = await books.checkIfBookExist(bookId);
    if (!checkIfBookExist) return res.status(404).json({ msg: "Book not exist" });

    const result = await books.updateBook({ id: bookId, ...req.body })

    res.status(201).json({ ...result });

  } catch (e) {
    res.status(500).json({ msg: e.message || "Internet server error" });
  }
});

booksRouter.delete("/:bookId", async (req, res) => {
  try {
    const { bookId } = req.params;
    const checkIfBookExist = await books.checkIfBookExist(bookId);
    if (!checkIfBookExist) return res.status(404).json({ msg: "Book not exist" });

    await books.deleteBook(bookId);

    res.sendStatus(204);
  } catch (e) {
    res.status(500).json({ msg: e.message || "Internet server error" });
  }
});


module.exports = booksRouter;
