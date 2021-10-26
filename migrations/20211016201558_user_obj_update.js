
exports.up = function(knex) {
  return knex.schema.alterTable("Users", table => {
    table.string("password").nullable().alter();
    table.dropColumn("authTokenGoogle");
    table.dropColumn("authTokenFacebook");
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable("Users", table => {
    table.string("password").notNullable().alter();
    table.string("authTokenGoogle").defaultTo(null);
    table.string("authTokenFacebook").defaultTo(null);
  });
};
