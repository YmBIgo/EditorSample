// 
'use strict';
var express = require("express");
const app 	= express();
const got 	= require("got");
const sqlite3 	= require("sqlite3")
var load_file   = require("./lib/func/load_file");
var code_snippet_getter = require("./lib/func/code_snippet");
var SqliteConnector 	= require("./lib/func/db/editor_sqlite.js");
const bodyParser = require("body-parser");

// init
var all_file = new Array;
var file_index_hash = new Map;
var original_path;
var index_page_file_name = "";
var db_callback;
var sqlite3_cursor		 = new sqlite3.Database("./lib/func/db/db_file/editor_sqlite.db", db_callback);
var sqlite_connection 	 = new SqliteConnector();
sqlite_connection.set_db_cursor(sqlite3_cursor);

// 
var server = app.listen(3000, function(){
	console.log("Node.js listen to" + server.address().port)
});

// 
// CSRF ...
// 
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(express.static('public'));

app.get("/index", function(req, res, next){
	// 
	index_page_file_name = req.query.file_name;
	console.log(index_page_file_name);
	res.render("index", {index_page_file_name: index_page_file_name});
});

app.get("/open_folder", function(req, res, next){
	//
	res.render("open_folder", {});
});

// [ get File ]
app.get("/file_info", function(req, res, next){
	// 
	var file_name = req.query.file_name;
	console.log(file_name);
	file_name = (file_name.length == 0) ? "./" : file_name;
	[all_file, file_index_hash, original_path] = load_file.read_files(file_name, 1, 1, [] ,0, 1, 1);
	res.json({files: all_file, files_indexed: file_index_hash, original_path: original_path});
});

app.get("/file", function(req, res, next){
	// 
	var file_name = req.query.filename;
	var file_number = req.query.filenumber;
	// file_name = "./" + file_name
	var file_content = load_file.read_file(file_name, file_number, all_file);
	res.json({file_content: file_content});
});

app.get("/tempfile", function(req, res, next){
	// 
	var file_name = req.query.filename;
	var file_content = load_file.read_tempfile(file_name);
	res.json({file_content: file_content});
});

// example call for commandline
// curl -X POST localhost:3000/create_tempfile -H "Content-type:application/json" -d "{\"file_path\":\"sample/hoge.txt\", \"file_content\":\"hoge\"}"
app.post('/create_tempfile', function(req, res, next){
	var file_path = req.body.file_path; // "temp_files/user_name/" + 
	var file_content = req.body.file_content;
	var create_tempfile_result = load_file.generate_temp_file(file_path, file_content);
	res.json({file_name: create_tempfile_result});
});

app.post('/create_file', function(req, res, next){
	var file_path = "files/user_name/" + req.body.file_path;
	var file_content = req.body.file_content;
	var create_file_result = load_file.generate_file(file_path, file_content);
	res.json({file_name: create_file_result});
});

// Qwant
app.get('/search_qwant', function(req, res, next){
	// 
	// should add user authentication
	var keyword 	  = req.query.keyword.replace(/\'/gi, "");
	var page_offset   = req.query.page_offset;
	var user_id 	  = req.query.user_id;
	var file_name 	  = req.query.file_name;
	var file_pos 	  = req.query.file_pos;
	var file_line 	  = req.query.file_line;
	var current_time  = new Date(); var current_time_string = current_time.toString();
	// save search history
	var default_search_history 	= sqlite_connection.default_search_history_cols();
	var search_history_data		= { "project_id" : 1, "keyword" : keyword, "file_name" : file_name, "file_pos" : file_pos, "file_line" : file_line, "created_at" : current_time_string, "updated_at" : current_time_string };
	sqlite_connection.insert_db_data_to_table(search_history_data, "search_histories", default_search_history);
	// get search result
	var qwant_url 	  = "https://api.qwant.com/api/search/web?count=10&offset=" + page_offset + "&q=" + keyword + "&language=german&t=web&uiv=1";
	var response_result;
	console.log(qwant_url);
	(async () => {
		try {
			const response = await got(qwant_url); // await 
			response_result = response.body
			// Status
		} catch (error) {
			console.log(error.response.body);
		}
	})()
	.then(function(){
		res.send({search_result: response_result})
	})
	// var search_result = load_file.search_qwant(keyword, page_offset);
	// console.log(search_result);
})

app.get('/get_code_data_from_url', function(req, res, next){
	// 
	var page_url 	= req.query.page_url;
	var response_result;
	code_snippet_getter.get_code_snippet_json(page_url, res);
})

// [ Generate Index JSON ]
// curl -X POST localhost:3000/create_index_json -H "Content-type:application/json" -d "{\"file_path\":\"./views\"}"
app.post('/create_index_json', function(req, res, next){
	// 
	var file_path 		 = req.body.file_path;
	var is_file_output	 = parseInt(req.body.is_output);
	var file_result_hash;
	if ( is_file_output == 1 ) {
		new Promise ((resolve, reject) => {
			file_result_hash = load_file.exec_save_file_index_json(file_path);
			resolve(file_result_hash);
		}).then(function(file_result){
			res.json({files_paths: file_result});
		}).catch(function(error){
			res.json({status: "error" + error})
		})
	} else {
		var file_result_hash = load_file.exec_save_file_index_json(file_path);
		try {
			res.json({file_paths: {}});
		}catch(error){
			res.json({status: "error" + error})
		}
	}
});

// [ Modal ]
app.get("/get_modal", function(req, res, next){
	// should change function name
	//    > tabjs の getJSON(/get_modal) 部分 など
	var file_content  = load_file.modal_file("public/files/html/new_file_name_modal.html");
	var html_contents = file_content.split("<script>");
	var html_content  = html_contents[0];
	var js_script	  = html_contents[1].replace("</script>", "");
	// json ?
	res.json({html_content: file_content, js_content: js_script});
});
app.get("/get_search_modal", function(req, res, next){
	var file_content  = load_file.modal_file("public/files/html/search_modal.html");
	var html_contents = file_content.split("<script>");
	var html_content  = html_contents[0];
	var js_script 	  = html_contents[1].replace("</script>", "");
	// json
	res.json({html_content: html_content, js_script: js_script});
})

// [ Default ]
app.get("/check_path", function(req, res, next){
	var file_path  = req.query.file_path; //
	var file_exist = load_file.check_path(file_path);
	res.json({ file_exist: file_exist });
});
