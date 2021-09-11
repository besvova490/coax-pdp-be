const { Router } = require("express");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");

const DB = require("../services/db");

const middleware = require("../middleware/validation");
const schemas = require("../schemas/auth");

const authRouter = Router();

require("dotenv").config()


authRouter.post("/login/", middleware(schemas.loginPost, "body"), async (req, res) => {
  try {
    const { email, password, authTokenGoogle, authTokenFacebook } = req.body;
    const user = await DB("Users").select().first().where({
      email,
    });
    console.log(password, user);

    if (!user) return res.status(404).json({ msg: `User with such email '${email}' not exist` });
    else if (password && !bcrypt.compareSync(password, user.password)) return res.status(403).json({ msg: "invalid password" });
    else if (!password && !authTokenGoogle && !authTokenFacebook) return res.status(403).json({ msg: "invalid password or user auth tokens" });
  
    const accessToken = JWT.sign(
      { id: user.id, email: user.email },
      process.env.EXPRESS_APP_JWT_ACCESS_SECRET,
      { expiresIn: 900 });
    const refreshToken = JWT.sign(
      { id: user.id, email: user.email },
      process.env.EXPRESS_APP_JWT_REFRESH_SECRET,
      { expiresIn: 86400 });
  
    return res.status(200).json({ accessToken, refreshToken });
  } catch (e) {
    res.status(500).json({ msg: e.message || "Internet server error" });
  }
});

authRouter.patch("/register/", middleware(schemas.registerPatch, "body"), async (req, res) => {
  try {
    const { email, password, firstName, lastName, avatar, authTokenGoogle, authTokenFacebook } = req.body;

    const ifEmailExist = await DB("Users").select().first().where({ email: email });
  
    if (ifEmailExist) return res.status(400).json({ msg: `User with such email '${email}' already exist` });
    
    await DB("Users").insert({
      email,
      firstName,
      lastName,
      avatar,
      authTokenGoogle,
      authTokenFacebook,
      password: bcrypt.hashSync(password, 10),
    });
  
    res.status(201).json({ msg: "User has been created" });
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
      const refreshToken = JWT.sign(
        { id: user.id, email: user.email },
        process.env.EXPRESS_APP_JWT_REFRESH_SECRET,
        { expiresIn: 86400 });

      return res.status(200).json({ accessToken, refreshToken });

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

      return res.sendStatus(204);
    });

  } catch (e) {
    res.status(500).json({ msg: e })
  }
});

module.exports = authRouter;
