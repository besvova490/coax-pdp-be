const { Router } = require("express");

const DB = require("../services/db");
const middleware = require("../middleware/validation");
const schemas = require("../schemas/author");
const authors = require("../models/author");

const authorsRouter = Router();


authorsRouter.get("/", async (req, res) => {
  try {
    const { maxResults, sortBy, startIndex, withoutPagination } = req.query;
    const authorsList = await authors.getAuthorsList({ maxResults, sortBy, startIndex, withoutPagination });

    res.status(200).json({ authorsList });
  } catch (e) {
    res.status(500).json({ msg: e.message || "Internet server error" });
  }
});

authorsRouter.get("/:authorId", async (req, res) => {
  try {
    const { authorId } = req.params;
    const author = await authors.getById(authorId);
    if(!author) return res.status(404).json({ msg: `Author '${authorId}' not found` });

    res.status(200).json({ ...author });
  } catch (e) {
    res.status(500).json({ msg: e.message || "Internet server error" });
  }
});

authorsRouter.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    const checkIfExist = await categories.checkIfExist(name);
    if(checkIfExist) return res.status(400).json({ msg: `Category '${title}' not found` });

    const category = await categories.getCategoryByTitle(title);

    res.status(200).json({ ...category });
  } catch (e) {
    res.status(500).json({ msg: e.message || "Internet server error" });
  }
});

authorsRouter.post("/create-author", middleware(schemas.authorPost, "body"), async (req, res) => {
  try {
    const { name, description, birthPlace, birthDate } = req.body;

    const checkIfExist = await authors.checkIfExist(name);
    if(checkIfExist) return res.status(400).json({ msg: `Author '${name}' already exist` });
  
    const newAuthor = await authors.createAuthor({ name, description, birthPlace, birthDate });
  
    res.status(201).json({ ...newAuthor });
  } catch (e) {
    res.status(500).json({ msg: e.message || "Internet server error" });
  }
});

authorsRouter.put("/:authorId", middleware(schemas.authorPut, "body"), async (req, res) => {
  try {
    const { authorId } = req.params;
    const author = await authors.getById(authorId);
    if(!author) return res.status(404).json({ msg: `Author '${authorId}' not found` });

    const updateResults = await authors.updateAuthor({ ...req.body }, authorId);

    res.status(200).json({ ...updateResults });
  } catch (e) {
    res.status(500).json({ msg: e.message || "Internet server error" });
  }
});


module.exports = authorsRouter;