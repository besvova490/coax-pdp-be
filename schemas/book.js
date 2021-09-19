const Joi = require("joi");

const schemas = {
  bookPatch: Joi.object({
    title: Joi.string().min(3).trim().required(),
    description: Joi.string().trim().min(150),
    shortDescription: Joi.string().trim().min(50),
    amount: Joi.number().required(),
    printType: Joi.string().trim(),
    publisher: Joi.string().trim(),
    publishedDate: Joi.date(),
    categories: Joi.array().items(Joi.string()),
    thumbnailLink: Joi.string().trim(),
    previewLink: Joi.string().trim(),
    language: Joi.string().trim(),
    discount: Joi.number(),
    pageCount: Joi.string().trim(),
  }),
};


module.exports = schemas;
