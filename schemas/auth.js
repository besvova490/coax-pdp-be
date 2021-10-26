const Joi = require("joi");

const schemas = {
  registerPost: Joi.object({
    firstName: Joi.string().alphanum().min(3).max(100).trim().required(),
    lastName: Joi.string().alphanum().min(3).max(100).trim().required(),
    avatar: Joi.string().trim(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).trim().required(),
    password: Joi.string().trim().pattern(new RegExp('^[A-Za-z0-9!@#$%^&*()<>+=?-]{8,30}$')).message("Password mast include inimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character"),
    confirmPassword: Joi.any()
    .equal(Joi.ref("password"))
    .required()
    .messages({ "any.only": "confirmPassword does not match" }),
  }).or("password", "authTokenGoogle", "authTokenFacebook"),
  loginPost: Joi.object({
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
    password: Joi.string(),
  }).or("password", "authTokenGoogle", "authTokenFacebook"),
};

module.exports = schemas;