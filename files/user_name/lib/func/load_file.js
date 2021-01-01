// 
var fs = require("fs");

/*
path / index / depth / file|folder / parent_id 
*/

var index_number = 0;
indexed_file_map = new Map();

// Read File Content
function readFile(file_path, file_number, array, is_gen_file=false){
	// Check whether files within "/files/user_name/..." path
	// - exist 
	//   get file path
	// - not exist
	//   create file and get file path
	f_file_path = searchToRoot(array, file_path, file_number);
	f_file_path.replace("..", "");
	// @ implemente hash file path is the best
	//   > should impl login func 
	var is_user_file_generated = checkGeneratedFilePath(f_file_path);
	console.log("generated file " + is_user_file_generated);
	if (is_user_file_generated == true) {
		f_file_path = "files/user_name/" + f_file_path;
		f_file_path.replace("//", "/");
		console.log("display updated file [" + f_file_path + "]");
	}
	var content = fs.readFileSync(f_file_path, 'utf-8');

	return content;
}

// Read File Path Data
function readFiles(file_path, file_index, file_depth, file_result, is_directory, parent_file_index=1){
	if ( file_depth == 1 && file_index == 1 ) { index_number = 0; console.log("init index") }
	files_array = []; indexed_file_hash = {};
	fs.readdirSync(file_path).forEach( function(file) {
		if ( file_depth == 1 && file == ".git" ) { return; }
		if ( file == "files"  && file_path == "./" ) { console.log(file); return; }
		var each_file_path = file_path + file + "/";
		file_depth = each_file_path.split("/").length - 2;
		file_index += file_depth == 1 ? 1 : 0;
		index_number += 1;
		if (file_depth == 1){
			indexed_file_map[file_index] = index_number
		}
		if (fs.lstatSync(each_file_path).isDirectory()) {
			file_result.push([file, file_index, file_depth, 0, index_number, parent_file_index]);
			readFiles(each_file_path, file_index, file_depth, file_result, 0, index_number);
		} else {
			file_result.push([file, file_index, file_depth, 1, index_number, parent_file_index]);
		}
	});
	return [file_result, indexed_file_map];
}

// function to generate file
function generateFile(file_path, file_content){
	// Generate Checck
	console.log("Original Path:" + file_path);
	var fixed_file_path = generate_file_path(file_path);
	console.log("File Path:" + fixed_file_path);
	var is_file_exist	= fs.existsSync(fixed_file_path);
	// Generate Folder If file is not exist.
	if ( is_file_exist == false ) {
		var fixed_file_path_splitted = fixed_file_path.split("/");
		var fixed_folder_path = fixed_file_path_splitted.slice(0, fixed_file_path_splitted.length-1).join("/");
		console.log("Folder Path:" + fixed_folder_path);
		fs.mkdirSync(fixed_folder_path, { recursive: true });
	}
	// Generate | Update File
	var writeStream = fs.createWriteStream(fixed_file_path);
	writeStream.on('error', err => console.log('error', err.message));
	writeStream.on('finish', () => console.log('finish'));
	writeStream.write(file_content);
	writeStream.end();
	return fixed_file_path;
}

function checkGeneratedFilePath(file_path){
	// 
	g_file_path = generate_file_path(file_path);
	console.log("checking " + g_file_path + " exist or not...");
	var is_file_exist = fs.existsSync(g_file_path);
	return is_file_exist
}

function checkGeneratedFileName(file_path){
	// 
	var file_path_format  = "files/user_name/"
	var is_file_generated = (file_path.slice(0, 16) == file_path_format && file_path.length >= 18)
	return is_file_generated
}

function generate_file_path(file_path){
	// example file path => "/files/user_name/[path]"
	// @ should block malicious input
	// @ can implement sessions or user login system
	var file_path_format  = "files/user_name/"
	var is_file_generated = checkGeneratedFileName(file_path);
	var result_file_path  = is_file_generated ? file_path : (file_path_format + file_path).replace("//", "/");
	return result_file_path
}

function searchToRoot(array, file_path, parent_id){
	// 
	var file_num     = parent_id;
	var file_results = file_path;
	var loop_hoge = 0
	while ( file_num > 1 ) {
		// 
		loop_hoge += 1
		if (loop_hoge == 20) { break }
		var prev_file = array.filter( item => item[4] == file_num )[0];
		file_num = prev_file[5];
		file_results = prev_file[0] + "/" + file_results
	}
	return file_results
}

// file_array = [];
// file_result = read_files("./", 0, 0, file_array ,0);
module.exports.read_files 	  = readFiles;
module.exports.read_file  	  = readFile;
// module.exports.search_to_root = searchToRoot;
module.exports.generate_file  = generateFile;
