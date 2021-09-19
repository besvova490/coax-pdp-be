const Joi = require("joi");

const schemas = {
  authorPatch: Joi.object({
    name: Joi.string().min(3).trim().required(),
    description: Joi.string(),
    birthPlace: Joi.string(),
    birthDate: Joi.date(),
  }),
  authorPut: Joi.object({
    description: Joi.string(),
    birthPlace: Joi.string(),
    birthDate: Joi.date(),
  }),
};


module.exports = schemas;
