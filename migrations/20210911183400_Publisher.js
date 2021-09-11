
exports.up = function(knex) {
  return knex.schema.createTable("Publisher", table => {
    table.increments("published_id");
    table.string("name").unique().notNullable();
    table.dateTime("createdAt").notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("Publisher");
};
