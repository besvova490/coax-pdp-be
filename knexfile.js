// Update with your config settings.
require("dotenv").config();

module.exports = {

  development: {
    client: "pg",
    connection: {
      user: "root",
      host: "localhost",
      database: "coax_pdp_db",
      password: "root",
      port: 5432,
    }
  },

  staging: {
    client: "pg",
    connection: {
      user: process.env.EXPRESS_APP_DB_USER_NAME,
      host: process.env.EXPRESS_APP_DB_HOST,
      database: process.env.EXPRESS_APP_DB_NAME,
      password: process.env.EXPRESS_APP_DB_USER_PASSWORD,
      port: process.env.EXPRESS_APP_DB_PORT,
      ssl: { rejectUnauthorized: false }
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};
