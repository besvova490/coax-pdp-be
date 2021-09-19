const express = require("express");

//routes
const authRouter = require("./routes/auth");
const booksRouter = require("./routes/books");
const categoriesRouter = require("./routes/categories");
const authorsRouter = require("./routes/author");

require("dotenv").config()

const app = express();

app.use(express.json());

app.use("/auth", authRouter);
app.use("/books", booksRouter);
app.use("/categories", categoriesRouter);
app.use("/authors", authorsRouter);

app.use((error, req, res, next) => {
  if (res.headerSent) return next(error);
  
  res.status(error.code || 500).json({ msg: e.message || "Internet server error" })
});

app.listen(process.env.EXPRESS_APP_PORT, () => console.log(`Server started at ${process.env.EXPRESS_APP_PORT} port`));
