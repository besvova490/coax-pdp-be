const axios = require("axios");
const { Router } = require("express");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library")

const DB = require("../services/db");

const middleware = require("../middleware/validation");
const schemas = require("../schemas/auth");

const authRouter = Router();

require("dotenv").config();

const googleClient = new OAuth2Client(process.env.EXPRESS_APP_CLIENT_ID)


authRouter.post("/login/", middleware(schemas.loginPost, "body"), async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await DB("Users").select().first().where({
      email,
    });
    
    if (!user) return res.status(404).json({ email: "User not found" });
    else if (!password || !user.password) return res.status(403).json({ password: "Invalid password" });
    else if (!bcrypt.compareSync(password, user.password)) return res.status(403).json({ password: "Invalid password" });
  
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

authRouter.post("/login/facebook", async (req, res) => {
  try {
    const { token }  = req.body;

    const resp = await axios.get(`https://graph.facebook.com/me?access_token=${token}&fields=id,email,first_name,last_name,picture`);
    const { email } = resp.data;
    const user = await DB("Users").select().first().where({
      email,
    });

    if (!user) return res.status(404).json({ email: "User not found" });

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

authRouter.post("/login/git-hub", async (req, res) => {
  try {
    const { code }  = req.body;

    const data = {
      code,
      client_id: process.env.EXPRESS_APP_GIT_HUB_CLIENT,
      client_secret: process.env.NEXT_PUBLIC_GIT_HUB_SECRET,
      redirect_url: "http://localhost:3000/"
    };

    const resp = await axios.post("https://github.com/login/oauth/access_token", data);
    const params = new URLSearchParams(resp.data);
    const access_token = params.get("access_token");

    const respUser = await axios("https://api.github.com/user/emails", {
      method: "GET",
      headers: {
        Authorization: `token ${access_token}`,
      },
    });

    const { email } = respUser.data[0];

    const user = await DB("Users").select().first().where({
      email,
    });

    if (!user) return res.status(404).json({ email: "User not found" });

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

authRouter.post("/login/google/", async (req, res) => {
  try {
    const { token }  = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.EXPRESS_APP_CLIENT_ID
    });

  const { email } = ticket.getPayload();

  const user = await DB("Users").select().first().where({ email: email });

  if (!user) return res.status(404).json({ msg: "User not found" });

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
    res.status(500).json({ msg: e });
  }
});

authRouter.post("/register/google/", async (req, res) => {
  try {
    const { token }  = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.EXPRESS_APP_CLIENT_ID
    });

  const { name, email, picture } = ticket.getPayload();

  const ifEmailExist = await DB("Users").select().first().where({ email: email });

  if (ifEmailExist) return res.status(400).json({ msg: `User with such email '${email}' already exist` });

  const [firstName = "", lastName = ""] = name.split(" ");
  
  const [newUser] = await DB("Users").insert({
    email,
    firstName,
    lastName,
    avatar: picture,
  }).returning("*");

  const accessToken = JWT.sign(
    { id: newUser.user_id, email: newUser.email },
    process.env.EXPRESS_APP_JWT_ACCESS_SECRET,
    { expiresIn: 1800 });
  const refreshToken = JWT.sign(
    { id: newUser.user_id, email: newUser.email },
    process.env.EXPRESS_APP_JWT_REFRESH_SECRET,
    { expiresIn: 86400 });

  res.status(201).json({ accessToken, refreshToken });
  } catch (e) {
    res.status(500).json({ msg: e });
  }
});

authRouter.post("/register/facebook/", async (req, res) => {
  try {
    const { token }  = req.body;

    const resp = await axios.get(`https://graph.facebook.com/me?access_token=${token}&fields=id,email,first_name,last_name,picture`);
    const { email, first_name: firstName, last_name: lastName, picture } = resp.data;
    const avatar = picture.data.url;

    const ifEmailExist = await DB("Users").select().first().where({ email: email });
  
    if (ifEmailExist) return res.status(400).json({ msg: `User with such email '${email}' already exist` });


    const [newUser] = await DB("Users").insert({
      email,
      firstName,
      lastName,
      avatar,
    }).returning("*");

    const accessToken = JWT.sign(
      { id: newUser.user_id, email: newUser.email },
      process.env.EXPRESS_APP_JWT_ACCESS_SECRET,
      { expiresIn: 1800 });
    const refreshToken = JWT.sign(
      { id: newUser.user_id, email: newUser.email },
      process.env.EXPRESS_APP_JWT_REFRESH_SECRET,
      { expiresIn: 86400 });
  
      res.status(201).json({ accessToken, refreshToken });
  } catch (e) {
    console.log(e);
    res.status(500).json({ msg: e });
  }
});

authRouter.post("/register/git-hub", async (req, res) => {
  try {
    const { code }  = req.body;

    const data = {
      code,
      client_id: process.env.EXPRESS_APP_GIT_HUB_CLIENT,
      client_secret: process.env.EXPRESS_APP_GIT_HUB_SECRET,
      redirect_url: process.env.EXPRESS_APP_FE_URL
    };

    const resp = await axios.post("https://github.com/login/oauth/access_token", data);
    const params = new URLSearchParams(resp.data);
    const access_token = params.get("access_token");

    const respSimpleUser = await axios("https://api.github.com/user", {
      method: "GET",
      headers: {
        Authorization: `token ${access_token}`,
      },
    });

    const { login } = respSimpleUser.data;

    const respFullUser = await axios(`https://api.github.com/users/${login}`, {
      method: "GET",
      headers: {
        Authorization: `token ${access_token}`,
      },
    });

    const { email, login: firstName, avatar_url: avatar } = respFullUser.data;

    if (!email) {
      return res.status(400).json({ msg: "not enougth information" });
    }

    const ifEmailExist = await DB("Users").select().first().where({ email: email });
  
    if (ifEmailExist) return res.status(400).json({ msg: `User with such email '${email}' already exist` });


    const [newUser] = await DB("Users").insert({
      email,
      firstName,
      lastName: "",
      avatar,
    }).returning("*");

    const accessToken = JWT.sign(
      { id: newUser.user_id, email: newUser.email },
      process.env.EXPRESS_APP_JWT_ACCESS_SECRET,
      { expiresIn: 1800 });
    const refreshToken = JWT.sign(
      { id: newUser.user_id, email: newUser.email },
      process.env.EXPRESS_APP_JWT_REFRESH_SECRET,
      { expiresIn: 86400 });
  
      res.status(201).json({ accessToken, refreshToken });
  } catch (e) {
    res.status(500).json({ msg: e.message || "Internet server error" });
  }
});

authRouter.post("/register/", middleware(schemas.registerPost, "body"), async (req, res) => {
  try {
    const { email, password, firstName, lastName, avatar } = req.body;

    const ifEmailExist = await DB("Users").select().first().where({ email: email });
  
    if (ifEmailExist) return res.status(400).json({ msg: `User with such email '${email}' already exist` });
    
    const [newUser] = await DB("Users").insert({
      email,
      firstName,
      lastName,
      avatar,
      password: bcrypt.hashSync(password, 10),
    }).returning("*");
  
    res.status(201).json({ id: newUser.id });
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
      if (e || !userObj || !userObj.id) return res.status(403).json({ msg: e });

      const user = await DB("Users").where("user_id", userObj.id).first();

      res.status(200).json({
        userId: user.user_id,
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

authRouter.delete("/delete", async (req, res) => {
  const { email } = req.body;

  const user = await DB("Users").where("email", email).first();

  if (!user) return res.status(400).json({ msg: `User with such email '${email}' already exist` });

  await DB("Users").delete().where("email", email);

  res.sendStatus(204);
});

module.exports = authRouter;
