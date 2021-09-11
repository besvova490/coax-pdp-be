const Joi = require("joi");

const schemas = {
  registerPatch: Joi.object({
    firstName: Joi.string().alphanum().min(3).max(100).required(),
    lastName: Joi.string().alphanum().min(3).max(100).required(),
    avatar: Joi.string(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
    password: Joi.string().pattern(new RegExp('^[A-Za-z0-9!@#$%^&*()<>+=?-]{8,30}$')).message("Password mast include inimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character"),
    authTokenGoogle: Joi.string(),
    authTokenFacebook: Joi.string(),
  }).or("password", "authTokenGoogle", "authTokenFacebook"),
  loginPost: Joi.object({
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
    password: Joi.string(),
    authTokenGoogle: Joi.string(),
    authTokenFacebook: Joi.string(),
  }).or("password", "authTokenGoogle", "authTokenFacebook"),
};

module.exports = schemas;