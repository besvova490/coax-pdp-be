const { Router } = require("express");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");

const DB = require("../services/db");

const middleware = require("../middleware/validation");
const schemas = require("../schemas/auth");

const authRouter = Router();

require("dotenv").config();


authRouter.post("/login/", middleware(schemas.loginPost, "body"), async (req, res) => {
  try {
    const { email, password, authTokenGoogle, authTokenFacebook } = req.body;
    const user = await DB("Users").select().first().where({
      email,
    });

    if (!user) return res.status(404).json({ email: "User not found" });
    else if (password && !bcrypt.compareSync(password, user.password)) return res.status(403).json({ password: "invalid password" });
    else if (!password && !authTokenGoogle && !authTokenFacebook) return res.status(403).json({ email: "invalid password or user auth tokens", password: "invalid password or user auth tokens" });
  
    const accessToken = JWT.sign(
      { id: user.user_id, email: user.email },
      process.env.EXPRESS_APP_JWT_ACCESS_SECRET,
      { expiresIn: 1800 });
    const refreshToken = JWT.sign(
      { id: user.user_id, email: user.email },
      process.env.EXPRESS_APP_JWT_REFRESH_SECRET,
      { expiresIn: 86400 });
  
    res.status(200).json({ accessToken, refreshToken });
  } catch (e) {
    res.status(500).json({ msg: e.message || "Internet server error" });
  }
});

authRouter.post("/register/", middleware(schemas.registerPost, "body"), async (req, res) => {
  try {
    const { email, password, firstName, lastName, avatar, authTokenGoogle, authTokenFacebook } = req.body;

    const ifEmailExist = await DB("Users").select().first().where({ email: email });
  
    if (ifEmailExist) return res.status(400).json({ msg: `User with such email '${email}' already exist` });
    
    const newUser = await DB("Users").insert({
      email,
      firstName,
      lastName,
      avatar,
      authTokenGoogle,
      authTokenFacebook,
      password: bcrypt.hashSync(password, 10),
    }).returning("*");
  
    res.status(201).json({ ...newUser });
  } catch(e) {
    res.status(500).json({ msg: e.message || "Internet server error" });
  }
});

authRouter.post("/token/", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ msg: "No refresh token has been provided" });

    JWT.verify(refreshToken, process.env.EXPRESS_APP_JWT_REFRESH_SECRET, async (e, user) => {
      if (e) return res.status(403).json({ msg: e });

      const blackListToken = await DB("TokensBlackList").select().first().where({ refreshToken: refreshToken });

      if (blackListToken) return res.status(403).json({ msg: "Provided token is invalid" })

      const accessToken = JWT.sign(
        { id: user.id, email: user.email },
        process.env.EXPRESS_APP_JWT_ACCESS_SECRET,
        { expiresIn: 900 });
      const refreshTokenNew = JWT.sign(
        { id: user.id, email: user.email },
        process.env.EXPRESS_APP_JWT_REFRESH_SECRET,
        { expiresIn: 86400 });

      res.status(200).json({ accessToken, refreshToken: refreshTokenNew });

    });


  } catch (e) {
    res.status(500).json({ msg: e.message })
  }
});

authRouter.delete("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ msg: "No refresh token has been provided" });

    JWT.verify(refreshToken, process.env.EXPRESS_APP_JWT_REFRESH_SECRET, async (e) => {
      if (e) return res.status(403).json({ msg: e });

      const blackListToken = await DB("TokensBlackList").select().first().where({ refreshToken: refreshToken });

      if (blackListToken) return res.status(403).json({ msg: "Provided token is invalid" })

      await DB("TokensBlackList").insert({ refreshToken: refreshToken });

      res.sendStatus(204);
    });

  } catch (e) {
    res.status(500).json({ msg: e })
  }
});

authRouter.get("/profile", async (req, res) => {
  try {
    const { authorization } = req.headers;
    const accessToken = authorization.split(" ")[1];
    
    JWT.verify(accessToken, process.env.EXPRESS_APP_JWT_ACCESS_SECRET, async (e, userObj) => {
      if (e || !userObj) return res.status(403).json({ msg: e });

      const user = await DB("Users").where("user_id", userObj.id).first();

      res.status(200).json({
        user_id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        isVendor: user.isVendor,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    });
  } catch (e) {
    res.status(500).json({ msg: e });
  }
});

module.exports = authRouter;
