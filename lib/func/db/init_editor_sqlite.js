// 
'use strict'
const sqlite3 		= require("sqlite3");
var SqliteConnector = require("./editor_sqlite.js");

// init db
var db_callback;
var sqlite3_cursor		 = new sqlite3.Database("./lib/func/db/db_file/editor_sqlite.db", db_callback);
var sqlite_connection 	 = new SqliteConnector();
sqlite_connection.set_db_cursor(sqlite3_cursor);

// [ drop table if needed ]
// 
// sqlite_connection.drop_table("users")
// sqlite_connection.drop_table("search_histories")
// sqlite_connection.drop_table("projects")

// make table
sqlite_connection.create_user_table();
sqlite_connection.create_search_history_table();
sqlite_connection.create_project_table();

// make default user
var current_time 		 = new Date(); current_time = current_time.toString();
var user_default_cols 	 = sqlite_connection.default_user_cols();
// check user
var user_cols 			 = ["id", "email", "first_name", "last_name"];
var check_user_condition = ["id = 1", "email = 'koffeekup@outlook.jp'"];
var select_user_data 	 = sqlite_connection.select_db_data(user_cols, check_user_condition, "users", user_default_cols, sqlite_connection, sqlite_connection);
select_user_data.then(function(r_array){
	var first_user_array = r_array["rows"].filter(item => item["id"] == 1);
	if ( first_user_array.length == 0 ) {
		var first_user_data 	 = { "id" : 1, "email" : "koffeekup@outlook.jp", "first_name" : "kazuya", "last_name" : "kurihara", "create_at" : current_time, "updated_at" : current_time };
		sqlite_connection.insert_db_data_to_table(first_user_data, "users", user_default_cols);
		// 
		console.log("create first user.");
	} else {
		console.log("user already created ...");
	}
})
