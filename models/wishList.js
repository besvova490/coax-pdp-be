const DB = require("../services/db");


const wishListModel = {
  getUserWishListBooks: async (userId, maxResults, startIndex ) => {
    const { count } = await DB("User_Wish_List").count().first();
    const userWishList = await DB("User_Wish_List")
    .select("Books.*")
    .leftJoin("Books", "User_Wish_List.book_id", "Books.id")
    .limit(maxResults <= 100 ? maxResults : 100)
    .offset(startIndex)
    .where("User_Wish_List.user_id", userId);

    return { userWishList, count };
  },

  getUserWishListSimple: async (userId ) => {
    const userWishList = await DB("User_Wish_List")
    .select("book_id")
    .where("User_Wish_List.user_id", userId);

    return { userWishList };
  },

  chekIfBookInWishList: async (bookId, userId) => {
    const checkIfBookinWithList = await DB("User_Wish_List").where({
      "book_id": bookId,
      "user_id": userId,
    }).first();

    return !!checkIfBookinWithList;
  },

  addBookToWithList: async (bookId, userId) => {
    const [result] = await DB("User_Wish_List").insert({
      "book_id": bookId,
      "user_id": userId,
    }).returning("*");

    return result;
  },

  deleteBookFromWishList: async (bookId, userId) => {
    const [result] = await DB("User_Wish_List")
    .delete()
    .where({
      "book_id": bookId,
      "user_id": userId,
    })
    .returning("*");

    return result;
  },
};

module.exports = wishListModel;
