const express = require("express");
var cors = require("cors");

//routes
const authRouter = require("./routes/auth");
const booksRouter = require("./routes/books");
const categoriesRouter = require("./routes/categories");
const authorsRouter = require("./routes/author");
const filesRouter = require("./routes/uploadImages");
const wishListRouter = require("./routes/wishList");

//middleware
const multerMid = require("./middleware/upload");
const authMiddleware = require("./middleware/protect");

require("dotenv").config()

const app = express();


app.use(cors({
  origin: "*",
}));
app.use(express.json());
app.use(express.raw({ type: "image/jpeg" }))
app.use(express.raw({ type: "image/png" }))
app.use(multerMid.single("body"));
app.use("/auth", authRouter);
app.use("/books", booksRouter);
app.use("/categories", categoriesRouter);
app.use("/authors", authorsRouter);
app.use("/images", filesRouter);
app.use("/wish-list", authMiddleware, wishListRouter);

app.use("*", (req, res) => {
  res.sendStatus(404);
});

app.use((error, req, res, next) => {
  if (res.headerSent) return next(error);
  
  res.status(error.code || 500).json({ msg: e.message || "Internet server error" })
});

app.listen(process.env.EXPRESS_APP_PORT, () => console.log(`Server started at ${process.env.EXPRESS_APP_PORT} port`));
