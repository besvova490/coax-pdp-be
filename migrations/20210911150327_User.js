
exports.up = function(knex) {
  return knex.schema.createTable("Users", table => {
    table.increments("user_id");
    table.string("email").unique().notNullable();
    table.string("password").notNullable();
    table.string("authTokenGoogle").defaultTo(null);
    table.string("authTokenFacebook").defaultTo(null);
    table.string("firstName").notNullable();
    table.string("lastName").notNullable();
    table.string("avatar").defaultTo(null);
    table.boolean("isVendor").defaultTo(false);
    table.boolean("isAdmin").defaultTo(false);
    table.dateTime("createdAt").notNullable().defaultTo(knex.fn.now());
    table.dateTime("updatedAt").notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("Users");
};
