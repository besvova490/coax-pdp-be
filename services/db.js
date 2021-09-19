const config = require('../knexfile');
require("dotenv").config();

const knex = require('knex')(process.env.NODE_ENV === "development" ? config.development : config.staging);

module.exports = knex;
