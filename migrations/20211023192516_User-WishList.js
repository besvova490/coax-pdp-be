
exports.up = function(knex) {
 return knex.schema.createTable("User_Wish_List", table => {
    table.increments("id").primary();
    table.integer("book_id").references("Books.id").onDelete("CASCADE");
    table.integer("user_id").references("Users.user_id").onDelete("CASCADE");
    table.dateTime("createdAt").notNullable().defaultTo(knex.fn.now());
    table.dateTime("updatedAt").notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("User_Wish_List");
};
