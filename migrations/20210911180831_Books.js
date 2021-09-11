
exports.up = function(knex) {
  return knex.schema.createTable("Books", table => {
    table.increments("book_id");
    table.string("title").unique().notNullable();
    table.text("description").defaultTo(null);
    table.string("shortDescription").defaultTo(null);
    table.string("publisher").unsigned().defaultTo(null);
    table.date("publishedDate").defaultTo(null);
    table.string("printType").defaultTo(null);
    table.string("categories").defaultTo(null);
    table.string("thumbnailLink").defaultTo(null);
    table.string("selfLink").defaultTo(null);
    table.string("previewLink").defaultTo(null);
    table.string("language").defaultTo(null);
    table.float("amount").defaultTo(null);
    table.float("discount").defaultTo(null);
    table.float("averageRating").defaultTo(null);
    table.integer("pageCount").defaultTo(null);
    table.dateTime("createdAt").notNullable().defaultTo(knex.fn.now());
    table.dateTime("updatedAt").notNullable().defaultTo(knex.fn.now());

    // table.foreign("publisher").references("published_id").inTable("Publisher");
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("Books");
};
