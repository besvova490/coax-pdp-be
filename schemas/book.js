const Joi = require("joi");

const schemas = {
  bookPatch: Joi.object({
    title: Joi.string().min(3).required(),
    description: Joi.string().min(150),
    shortDescription: Joi.string().min(50),
    amount: Joi.number().required(),
    printType: Joi.string(),
    publisher: Joi.string(),
    publishedDate: Joi.date(),
    categories: Joi.array().items(Joi.string()),
    thumbnailLink: Joi.string(),
    previewLink: Joi.string(),
    language: Joi.string(),
    discount: Joi.number(),
    pageCount: Joi.string(),
  }),
};


module.exports = schemas;
