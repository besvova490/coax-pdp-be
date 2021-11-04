const { Router } = require("express");
const JWT = require("jsonwebtoken");

const DB = require("../services/db");

const middleware = require("../middleware/validation");
const schemas = require("../schemas/book");
const books = require("../models/books");

const booksRouter = Router();


booksRouter.get("/", async(req, res) => {
  try {
    const { maxResults = 20, sortBy = "id", startIndex = 0 } = req.query;
    const result = await books.getBooksList({ maxResults, sortBy, startIndex });

    res.status(200).json({ ...result });
  } catch(e) {
    res.status(500).json({ msg: e.message || "Internet server error" }); 
  }
});

booksRouter.get("/my-books", async (req, res) => {
  try {
    const authToken = req.headers["authorization"];
    const token = authToken && authToken.split(" ")[1];

    JWT.verify(token, process.env.EXPRESS_APP_JWT_ACCESS_SECRET, async (e, user) => {
      const book = await books.getUserBooks(+user.id);
  
      if (!book) return res.status(404).json({ msg: "Book not found" });
  
      res.status(200).json({ ...book });
    });
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

booksRouter.get("/get-by-category/:categoryTitle", async(req, res) => {
  try {
    const { categoryTitle } = req.params
    const book = await books.getByCategoryTitle(categoryTitle);

    if (!book) return res.status(404).json({ msg: "Book not found" });

    res.status(200).json({ ...book });
  } catch(e) {
    res.status(500).json({ msg: e.message || "Internet server error" }); 
  }
});

booksRouter.post("/create-book", middleware(schemas.bookPost, "body"), async (req, res) => {

  try {
    const {
      title,
      description,
      amount,
      printType,
      shortDescription,
      publishedDate,
      authors,
      categories,
      thumbnailLink,
      previewLink,
      discount,
      pageCount,
    } = req.body;

    const isBookExist = await DB("Books").select().first().where({ title });
    if (isBookExist) return res.status(400).json({ msg: `Book with such title '${title} already exist'` });

    console.log(authors, categories);

    const book = await books.createBook({
      title,
      description,
      amount: +amount,
      printType,
      shortDescription,
      publishedDate,
      thumbnailLink,
      previewLink,
      discount,
      pageCount: +pageCount,
    }, { authors, categories });

    const authToken = req.headers["authorization"];
    const token = authToken && authToken.split(" ")[1];

    JWT.verify(token, process.env.EXPRESS_APP_JWT_ACCESS_SECRET, async (e, user) => {
      await books.addBookToUser(book.id, user.id);
    });

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
