const Joi = require("joi");

const schemas = {
  categoryPatch: Joi.object({
    title: Joi.string().min(3).trim().required(),
  }),
};


module.exports = schemas;
