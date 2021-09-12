
exports.up = function(knex) {
  return Promise.all([
    knex.schema.createTable("Categories", table => {
      table.increments("category_id").primary();
      table.string("title").unique().notNullable();
      table.dateTime("createdAt").notNullable().defaultTo(knex.fn.now());
      table.dateTime("updatedAt").notNullable().defaultTo(knex.fn.now());
    }),
    knex.schema.createTable("Books_Categories", table => {
      table.increments("Books_Categories_id").primary();
      table.integer("book_id").references("Books.book_id");
      table.integer("category_id").references("Categories.category_id");
      table.dateTime("createdAt").notNullable().defaultTo(knex.fn.now());
      table.dateTime("updatedAt").notNullable().defaultTo(knex.fn.now());
    })
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.dropTableIfExists("Categories"),
    knex.schema.dropTableIfExists("Books_Categories"),
  ]);
};
