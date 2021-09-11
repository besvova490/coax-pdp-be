
exports.up = function(knex) {
  return knex.schema.createTable("TokensBlackList", table => {
    table.string("refreshToken").notNullable();
    table.dateTime("createdAt").notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("TokensBlackList");
};
