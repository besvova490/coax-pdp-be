const { Router } = require("express");

const DB = require("../services/db");
const category = require("../models/categories");

const categotiesRouter = Router();

categotiesRouter.get("/", async (req, res) => {

  const categories = await category.getCategoriesList();

  res.status(200).json({ categories });
});

categotiesRouter.patch("/", async (req, res) => {
  const { title } = req.body;

  if(await category.checkIfExist(title)) return res.status(400).json({ msg: `Such canegory '${title}' already exist` });

  const newCategory = await category.createCategory(title);

  res.status(201).json({ ...newCategory });
});

module.exports = categotiesRouter;