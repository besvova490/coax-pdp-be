const { Router } = require("express");

const DB = require("../services/db");
const wishListModel = require("../models/wishList");


const wishListRouter = Router();

wishListRouter.get("/", async(req, res) => {
  try {
    const { id } = req.user;
    const { maxResults, startIndex, simple } = req.query;

    if (!simple) {
      const { userWishList, count } = await wishListModel.getUserWishListBooks(id, maxResults, startIndex);

      res.status(200).json({ wishList: userWishList, count });
    } else {
      const { userWishList } = await wishListModel.getUserWishListSimple(id);

      const response = userWishList.map(item => item.book_id);

      res.status(200).json({ wishList: response });
    }
  } catch (e) {
    res.status(500).json({ msg: e })
  }
});

wishListRouter.post("/", async(req, res) => {
  try {
    const { bookId } = req.body;
    
    const { id } = req.user;
    const user = await DB("Users").where("user_id", id).first();
    const checkIfBookinWishList = await wishListModel.chekIfBookInWishList(bookId, id);

    if (!user) return res.status(401).json({ msg: "User not exist" });
    else if (checkIfBookinWishList) return res.status(400).json({ msg: "Book already in wish list" });

    const result = await wishListModel.addBookToWithList(bookId, id);

    res.status(200).json({ ...result });
  } catch (e) {
    res.status(500).json({ msg: `${e}` });
  }
});

wishListRouter.delete("/:bookId", async(req, res) => {
  try {
    const { bookId } = req.params
    
    const { id } = req.user;
    const user = await DB("Users").where("user_id", id).first();
    const checkIfBookinWishList = await wishListModel.chekIfBookInWishList(bookId, id);

    if (!user) return res.status(401).json({ msg: "User not exist" });
    else if (!checkIfBookinWishList) return res.status(400).json({ msg: "Book not exist in user wish list" });

    await wishListModel.deleteBookFromWishList(bookId, id);

    res.sendStatus(204);
  } catch (e) {
    res.status(500).json({ msg: e });
  }
});


module.exports = wishListRouter;
