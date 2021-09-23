const Joi = require("joi");

const schemas = {
  bookPost: Joi.object({
    title: Joi.string().min(3).trim().required(),
    description: Joi.string().trim().min(150),
    shortDescription: Joi.string().trim().min(10),
    amount: Joi.number().required(),
    printType: Joi.string().trim(),
    publisher: Joi.string().trim(),
    publishedDate: Joi.date(),
    categories: Joi.array().items(Joi.string()),
    authors: Joi.array().items(Joi.string()),
    thumbnailLink: Joi.string().trim(),
    previewLink: Joi.string().trim(),
    language: Joi.string().trim(),
    discount: Joi.number(),
    pageCount: Joi.number(),
    averageRating: Joi.number(),
  }),
};


module.exports = schemas;
