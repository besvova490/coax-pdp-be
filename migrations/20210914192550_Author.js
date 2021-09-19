
exports.up = function(knex) {
  return Promise.all([
    knex.schema.createTable("Authors", table => {
      table.increments("author_id").primary();
      table.string("name").unique().notNullable();
      table.dateTime("createdAt").notNullable().defaultTo(knex.fn.now());
      table.dateTime("updatedAt").notNullable().defaultTo(knex.fn.now());
      table.text("description").defaultTo(null);
      table.string("birthPlace").defaultTo(null);
      table.date("birthDate").defaultTo(null);
      table.string("avatar").defaultTo(null);
    }),
    knex.schema.createTable("Books_Authors", table => {
      table.increments("book_author_id").primary();
      table.integer("book_id").references("Books.book_id").onDelete("CASCADE");
      table.integer("author_id").references("Authors.author_id").onDelete("CASCADE");
      table.dateTime("createdAt").notNullable().defaultTo(knex.fn.now());
      table.dateTime("updatedAt").notNullable().defaultTo(knex.fn.now());
    }),
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.dropTableIfExists("Books_Authors"),
    knex.schema.dropTableIfExists("Authors"),
  ]);
};
