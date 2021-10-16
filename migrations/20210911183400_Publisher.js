exports.up = function(knex) {
  return Promise.all([
    knex.schema.createTable("Publisher", table => {
      table.increments("id").primary();
      table.string("name").unique().notNullable();
      table.dateTime("createdAt").notNullable().defaultTo(knex.fn.now());
      table.dateTime("updatedAt").notNullable().defaultTo(knex.fn.now());
    }),
    knex.schema.createTable("Publisher_Books", table => {
      table.increments("id").primary();
      table.integer("book_id").references("Books.id").onDelete("CASCADE");
      table.integer("publisher_id").references("Publisher.id").onDelete("CASCADE");
      table.dateTime("createdAt").notNullable().defaultTo(knex.fn.now());
      table.dateTime("updatedAt").notNullable().defaultTo(knex.fn.now());
    })
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.dropTableIfExists("Publisher_Books"),
    knex.schema.dropTableIfExists("Publisher"),
  ]);
};
