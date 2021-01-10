// 
var express = require("express");
var app = express();
var load_file  = require("./lib/func/load_file");
var bodyParser = require("body-parser");
// 
var all_file = new Array;
var file_index_hash = new Map;
[all_file, file_index_hash] = load_file.read_files("./", 1, 1, [] ,0, 1);

var server = app.listen(3000, function(){
	console.log("Node.js listen to" + server.address().port)
});

// 
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(express.static('public'));

app.get("/index", function(req, res, next){
	res.render("index", {files: all_file, files_indexed: file_index_hash});
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
})

// example call for commandline
// curl -X POST localhost:3000/create_tempfile -H "Content-type:application/json" -d "{\"file_path\":\"sample/hoge.txt\", \"file_content\":\"hoge\"}"
app.post('/create_tempfile', function(req, res, next){
	var file_path = req.body.file_path; // "temp_files/user_name/" + 
	var file_content = req.body.file_content;
	var create_tempfile_result = load_file.generate_temp_file(file_path, file_content);
	res.json({file_name: create_tempfile_result});
})

app.post('/create_file', function(req, res, next){
	var file_path = "files/user_name/" + req.body.file_path;
	var file_content = req.body.file_content;
	var create_file_result = load_file.generate_file(file_path, file_content);
	res.json({file_name: create_file_result});
});