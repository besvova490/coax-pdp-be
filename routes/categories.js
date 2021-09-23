const { Router } = require("express");

const { DB } = require("../services/db");
const middleware = require("../middleware/validation");
const schemas = require("../schemas/category");
const categories = require("../models/categories");

const categotiesRouter = Router();


categotiesRouter.get("/", async (req, res) => {
  try {
    const { maxResults = 20, sortBy = "category_id", startIndex = 0 } = req.query;
    const categoriesList = await categories.getCategoriesList({ maxResults, sortBy, startIndex });

    res.status(200).json({ categoriesList });
  } catch (e) {
    res.status(500).json({ msg: e.message || "Internet server error" });
  }
});

categotiesRouter.get("/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await categories.getCategoryById(categoryId);
    if(!category) return res.status(404).json({ msg: `Category '${categoryId}' not found` });

    res.status(200).json({ ...category });
  } catch (e) {
    res.status(500).json({ msg: e.message || "Internet server error" });
  }
});

categotiesRouter.post("/", async (req, res) => {
  try {
    const { title } = req.body;
    const checkIfExist = await categories.checkIfExist(title);
    if(!checkIfExist) return res.status(404).json({ msg: `Category '${title}' not found` });

    const category = await categories.getCategoryByTitle(title);

    res.status(200).json({ ...category });
  } catch (e) {
    res.status(500).json({ msg: e.message || "Internet server error" });
  }
});

categotiesRouter.post("/create-category",  middleware(schemas.categoryPost, "body"), async (req, res) => {
  try {
    const { title } = req.body;
    const checkIfExist = await categories.checkIfExist(title);
    if(checkIfExist) return res.status(400).json({ msg: `Such canegory '${title}' already exist` });
  
    const newCategory = await categories.createCategory(title);
  
    res.status(201).json({ ...newCategory });
  } catch (e) {
    res.status(500).json({ msg: e.message || "Internet server error" });
  }
});

categotiesRouter.delete("/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;
    const checkIfExist = await categories.checkIfExistById(categoryId);
    if(!checkIfExist) return res.status(404).json({ msg: `Category '${categoryId}' not found` });


    await categories.deleteCategory(categoryId);
    res.sendStatus(204);
  } catch (e) {
    res.status(500).json({ msg: e.message || "Internet server error" });
  }
});

module.exports = categotiesRouter;