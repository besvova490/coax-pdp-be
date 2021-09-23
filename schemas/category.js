const Joi = require("joi");

const schemas = {
  categoryPost: Joi.object({
    title: Joi.string().min(3).trim().required(),
  }),
};


module.exports = schemas;
