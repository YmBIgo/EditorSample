// 
const sqlite3 = require("sqlite3").verbose();

class SqliteConnector {
	constrctor() {
		this.sqlite3_db;
		this.table_name_array = [];
		// db.close(db_callback)
	}
	set_db_cursor(db_cursor){
		this.sqlite3_db = db_cursor;
	}
	get_editor_db(){
		//
		var table_names;
		this.sqlite3_db.all("SELECT name FROM sqlite_master WHERE type='table';", function(err, t_names){
			table_names = t_names.map( item => item["name"] )
			console.log(table_names);
		});
		return table_names
	}
	check_editor_db(db_name){
		// 
		var table_names;
		var check_table_name_query = "SELECT name FROM sqlite_master WHERE type='table' AND name='" + db_name + "';"
		this.sqlite3_db.all(check_table_name_query, function(err, t_names){
			table_names = t_names.map( item => item["name"] );
			if ( table_names.length == 0 ) {
				console.log("not found ...");
				return false;
			} else {
				console.log("db found.")
				return true
			}
		});
	}
	// < User > 
	// check schema @ txt
	// [ Create User Table ]
	create_user_table(){
		// 
		var create_table_cols  = "(id integer PRIMARY KEY AUTOINCREMENT,email varchar NOT NULL UNIQUE,first_name varchar,last_name varchar,bcrypto_password varchar,created_at datetime,updated_at datetime)";
		var create_table_query = "CREATE TABLE IF NOT EXISTS users " + create_table_cols + ";"
		this.sqlite3_db.exec(create_table_query);
	}
	// [ Search History ]
	create_search_history_table(){
		var create_search_history_cols  = "(id integer PRIMARY KEY AUTOINCREMENT, project_id integer, keyword varchar, file_name varchar, file_line integer, file_pos integer, user_id integer, created_at datetime, updated_at datetime)";
		var create_search_history_query = "CREATE TABLE IF NOT EXISTS search_histories " + create_search_history_cols + ";";
		this.sqlite3_db.exec(create_search_history_query);
	}
	// [ Project ]
	create_project_table(){
		var create_project_cols 	= "(id integer PRIMARY KEY AUTOINCREMENT, user_id integer, name varchar, file_path varchar, created_at datetime, updated_at datetime)";
		var create_project_query 	= "CREATE TABLE IF NOT EXISTS projects " + create_project_cols + ";";
		this.sqlite3_db.exec(create_project_query);
	}
	// [ Insert Data ]
	insert_db_data_to_table(insert_data, db_table_name="users", default_cols){
		// insert_data should be associative array
		if ( Array.isArray(default_cols) != true ) { default_cols = this.default_user_cols() }
		const enable_default_array  = default_cols;
		var insert_data_keys 		= Object.keys(insert_data);
		var writable_keys 			= insert_data_keys.filter(item => enable_default_array.indexOf(item) != -1 );
		var writable_value 			= writable_keys.map(item => insert_data[item]);
		// col data
		var insert_table_cols  	= "(";
		writable_keys.forEach(function(d_key){
			insert_table_cols   += d_key + ", "
		});
		insert_table_cols += ")"
		// value data
		var insert_table_data	= "(";
		for ( var i = 0; i < writable_value.length; i++ ){
			var d_value = writable_value[i];
			if ( typeof d_value == "number" ) {
				insert_table_data += d_value;
			} else {
				var escaped_d_value = this.escape_word(d_value);
				insert_table_data += "'" + escaped_d_value + "'";
			}
			if ( i != writable_value.length - 1 ) { insert_table_data += ", " }
		}
		insert_table_data += ");"
		var insert_table_query 	= "INSERT INTO " + db_table_name + " " + insert_table_cols + " VALUES " + insert_table_data;
		insert_table_query = insert_table_query.replace(/,\s\)/gi, ")");
		console.log(insert_table_query);
		this.sqlite3_db.run(insert_table_query, function(err){
			if (err) { console.log(err.message); return false }
		});
		console.log("Insert data data to " + db_table_name + " ...");
	}
	// [ Update Data ]
	update_db_date_to_table(update_data, condition_array, db_table_name="users", default_cols){
		// update data should be associative array
		if ( Array.isArray(default_cols) != true ) { default_cols = this.default_user_cols() }
		const enable_default_array 	= default_cols;
		var update_data_keys 	 	= Object.keys(update_data);
		var updating_keys 		 	= update_data_keys.filter(item => enable_default_array.indexOf(item) != -1 );
		var updating_values 	 	= updating_keys.map(item => update_data[item]);
		// update data
		var update_set_data 	 = "";
		for ( var i = 0; i < update_data_keys.length; i++ ){
			var u_key 	= updating_keys[i];
			var u_value = updating_values[i];
			if ( typeof u_value == "number" ) {
				update_set_data += u_key + " = " + u_value + " "
			} else {
				var escaped_u_value = this.escape_word(u_value);
				update_set_data += u_key + " = '" + escaped_u_value + "'"
			}
			if ( i != update_data_keys.length - 1 ) { update_set_data += ", " }
		}
		var update_condition_data = "";
		if ( condition_array.length > 0 ) {
			// condition data > array から取得するだけ
			update_condition_data = " WHERE "
			for ( var j = 0; j < condition_array.length; j++ ) {
				update_condition_data += condition_array[j];
				if ( j != condition_array.length - 1 ) { update_condition_data += " AND " }
			}
		}
		var update_table_query = "UPDATE " + db_table_name + " SET " + update_set_data + update_condition_data + ";"
		console.log(update_table_query);
		this.sqlite3_db.run(update_table_query, function(err){
			if (err) { console.log(err.message); return false }
		})
	}
	// [ Select Data ]
	select_db_data(select_cols, condition_array, db_table_name="users", default_cols){
		// select data > array
		if ( Array.isArray(default_cols) != true ) { default_cols = this.default_user_cols() }
		const enable_default_array = default_cols;
		var select_keys 		 = select_cols.filter(item => enable_default_array.indexOf(item) != -1);
		// append select data
		var select_cols 		 = "";
		for ( var i = 0; i < select_keys.length; i++ ){
			select_cols += select_keys[i];
			if ( i != select_keys.length - 1 ) { select_cols += ", " }
		}
		var select_condition 	 = "";
		if ( condition_array.length > 0 ) {
			select_condition = " WHERE ";
			for ( var j = 0; j < condition_array.length; j++ ) {
				select_condition 	 += condition_array[j];
				if ( j != condition_array.length - 1 ) { select_condition += " AND " }
			}
		}
		var select_table_query	 = "SELECT " + select_cols + " FROM " + db_table_name + select_condition + ";";
		console.log(select_table_query);
		var select_result = []
		return new Promise (function (resolve, reject){
			// variable name "sqlite_connection"
			sqlite_connection.sqlite3_db.all(select_table_query, function(err, rows){
				if (err) {
					throw reject(err);
				} else {
					resolve({rows: rows});
				}
			});
		})
		console.log(select_result);
		return select_result;
	}
	// [ Drop Table ]
	drop_table(table_name){
		var drop_table_query = "DROP TABLE " + table_name + ";";
		this.sqlite3_db.run(drop_table_query, function(err){
			if (err) {
				console.log(err.message);
				return false
			}
		})
	}

	// default variable array
	default_user_cols(){
		return ["id", "email", "first_name", "last_name", "bcrypto_password", "created_at", "updated_at"];
	}
	default_search_history_cols(){
		return ["id", "project_id", "keyword", "file_name", "file_line", "file_pos", "user_id", "created_at", "updated_at"];
	}
	default_project_cols(){
		return ["id", "user_id", "name", "file_path", "created_at", "updated_at"];
	}
	escape_word(word){
		// 
		var escaped_word = word.replace(/\'/gi, "''");
		return escaped_word
	}
}

// [[ Sample Usage ]]

// << Init >>
// 
// var db_callback;
// var sqlite3_cursor = new sqlite3.Database("db/editor_sqlite.db", db_callback);
// sqlite_connection  = new SqliteConnector();
// sqlite_connection.set_db_cursor(sqlite3_cursor);

// << User >> 
//
// [ Create table ]
// 
// sqlite_connection.create_user_table();
// 
// [ Insert sample ]
//
// var current_time   		= new Date(); current_time = current_time.toString();
// var insert_user_data 	= { "id" : 2, "email" : "hogefugahoge@test.com", "first_name" : "kazuya", "last_name" : "kurihara", "created_at" : current_time, "updated_at" : current_time };
// var user_default_array 	= sqlite_connection.default_user_cols();
// sqlite_connection.insert_db_data_to_table(insert_user_data, "users", user_default_array);
// 
// [ Edit sample ]
// 
// var update_user_data = { "first_name" : "seigen", "last_name" : "go" };
// var update_user_condtion  = ["id = 2"];
// sqlite_connection.update_db_date_to_table(update_user_data, update_user_condtion);
// 
// [ Select sample ]
// 
// var select_user_cols 	  = ["id", "email", "first_name"];
// var select_user_condition = ["id = 1"];
// var select_user_array 	  = [];
// var user_default_array 	  = sqlite_connection.default_user_cols();
// var select_user_data = sqlite_connection.select_db_data(select_user_cols, select_user_condition, "users", user_default_array);
// select_user_data.then(function(rows_array){
// 	console.log(rows_array);
// 	select_user_array = rows_array;
// });

// << Search History >>
// 
// [ Create sample ]
// 
// sqlite_connection.create_search_history_table();
// 
// [ Insert sample ]
//
// var current_time   				 = new Date(); current_time = current_time.toString();
// var insert_search_history_data 	 = { "id" : 2, "project_id" : 1, "keyword" : "python", "file_name" : "sample.js", "file_line" : 3, "file_pos" : 4, "user_id" : 1, "created_at" : current_time, "updated_at" : current_time };
// var search_history_default_array = sqlite_connection.default_search_history_cols();
// sqlite_connection.insert_db_data_to_table(insert_search_history_data, "search_histories", search_history_default_array);
// 
// [ Edit sample ]
// 
// var update_search_history_data 	 = { "project_id" : 2, "keyword" : "ruby" };
// var update_search_history_condition = ["id = 2"];
// var search_history_default_array = sqlite_connection.default_search_history_cols();
// sqlite_connection.update_db_date_to_table(update_search_history_data, update_search_history_condition, "search_histories", search_history_default_array);
// 
// [ Select sample ]
//
// var select_search_history_cols 		= ["id", "project_id", "keyword", "file_name", "user_id"];
// var select_search_history_condition  = ["id = 1", "keyword = 'python'"];
// var select_search_history_array		= [];
// var search_history_default_array	= sqlite_connection.default_search_history_cols();
// var select_search_history_data 		= sqlite_connection.select_db_data(select_search_history_cols, select_search_history_condition, "search_histories", search_history_default_array);
// select_search_history_data.then(function(rows_array){
// 	console.log(rows_array);
// 	select_search_history_array = rows_array;
// });

// << Project >>
// 
// [ Create table ]
// sqlite_connection.create_project_table();
// 
// [ Insert sample ]
// 
// var current_time 			= new Date(); current_time = current_time.toString();
// var insert_project_data 	= { "id" : 1, "user_id" : 1, "name" : "test1", "file_path" : "/programming/codes/web_editor/", "created_at" : current_time, "updated_at" : current_time };
// var project_default_array 	= sqlite_connection.default_project_cols();
// sqlite_connection.insert_db_data_to_table(insert_project_data, "projects", project_default_array);
// 
// [ Edir sample ]
// 
// var update_project_data 	= { "user_id" : 2, "name" : "editor project" };
// var update_project_condition = ["id = 1"];
// var project_default_array	= sqlite_connection.default_project_cols();
// sqlite_connection.update_db_date_to_table(update_project_data, update_project_condition, "projects", project_default_array);
// 
// [ Select sample ]
// 
// var select_project_cols		 = ["id", "name", "file_path"];
// var select_project_condition = ["id = 1"];
// var project_default_array 	 = sqlite_connection.default_project_cols();
// var select_project_array 	 = [];
// var select_project_data 	 = sqlite_connection.select_db_data(select_project_cols, select_project_condition, "projects", project_default_array);
// select_project_data.then(function(rows_array){
// 	console.log(rows_array);
// 	select_project_array = rows_array;
// });
// 