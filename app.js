// 
var express = require("express");
var app = express();
var load_file  = require("./lib/func/load_file");
var bodyParser = require("body-parser");
// 
var all_file = new Array;
var file_index_hash = new Map;
var original_path;
var index_page_file_name = "";
// [all_file, file_index_hash] = load_file.read_files("./", 1, 1, [] ,0, 1);

var server = app.listen(3000, function(){
	console.log("Node.js listen to" + server.address().port)
});

// 
app.set('view engine', 'ejs');

app.use(bodyParser.json());
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
	var file_content  = load_file.modal_file();
	var html_contents = file_content.split("<script>");
	var html_content  = html_contents[0];
	var js_script	  = html_contents[1].replace("</script>");
	// json ?
	res.json({html_content: file_content, js_content: js_script});
});

// [ Default ]
app.get("/check_path", function(req, res, next){
	var file_path  = req.query.file_path; //
	var file_exist = load_file.check_path(file_path);
	res.json({ file_exist: file_exist });
});


