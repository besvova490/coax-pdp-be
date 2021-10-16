exports.up = function(knex) {
  return Promise.all([
    knex.schema.createTable("Categories", table => {
      table.increments("id").primary();
      table.string("title").unique().notNullable();
      table.dateTime("createdAt").notNullable().defaultTo(knex.fn.now());
      table.dateTime("updatedAt").notNullable().defaultTo(knex.fn.now());
    }),
    knex.schema.createTable("Books_Categories", table => {
      table.increments("id").primary();
      table.integer("book_id").references("Books.id").onDelete("CASCADE");
      table.integer("category_id").references("Categories.id").onDelete("CASCADE");
      table.dateTime("createdAt").notNullable().defaultTo(knex.fn.now());
      table.dateTime("updatedAt").notNullable().defaultTo(knex.fn.now());
    })
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.dropTableIfExists("Books_Categories"),
    knex.schema.dropTableIfExists("Categories"),
  ]);
};
