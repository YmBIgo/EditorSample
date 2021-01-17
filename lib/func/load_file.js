// 
var fs = require("fs");
var simple_indexer 		= require("./index/index_file");
var common_functions 	= require("./default_function");

/*
path / index / depth / file|folder / parent_id 
*/

var index_number = 0;
indexed_file_map = new Map();
var original_file_path_len;

// Read File Content
function readFile(file_path, file_number, file_array, is_gen_file=false){
	// Check whether files within "/files/user_name/..." path
	// - exist 
	//   get file path
	// - not exist
	//   create file and get file path
	f_file_path = searchToRoot(file_array, file_path, file_number);
	f_file_path = common_functions.replaceAll(f_file_path, "..", "");
	// @ implemente hash file path is the best
	//   > should impl login func 
	var is_user_file_generated = checkGeneratedFilePath(f_file_path);
	console.log("generated file " + is_user_file_generated);
	if (is_user_file_generated == true) {
		f_file_path = "files/user_name/" + f_file_path;
		f_file_path = common_functions.replaceAll(f_file_path, "//", "/");
		console.log("display updated file [" + f_file_path + "]");
	}
	var content = fs.readFileSync(f_file_path, 'utf-8');

	return content;
}

// Read TempFile
function readTempfile(file_path){
	// 
	var f_file_path = checkAndReturnPath(file_path); // 
	var f_file_path_splitted = f_file_path.split("/");
	var f_file_path_length   = f_file_path_splitted.length;
	var f_file_path_folder   = f_file_path_splitted.slice(0, f_file_path_length-1).join("_");
	var f_file_path_file 	 = f_file_path_splitted.slice(f_file_path_length-1, f_file_path_length)[0];
	var temp_file_path 		 = f_file_path_folder + "/" + f_file_path_file;
	console.log(temp_file_path + " ...");
	var temp_file_path 		 = common_functions.replaceAll(temp_file_path, "..", "");
	var is_user_file_generated = checkGeneratedFilePath(temp_file_path, 1);
	if ( is_user_file_generated == false ) { return "" }
	console.log("file exists in original folder.");
	temp_file_path = "temp_files/user_name/" + temp_file_path;
	temp_file_path = common_functions.replaceAll(temp_file_path, "//", "/");
	console.log("Display updated file [" + temp_file_path + "]");
	var content = fs.readFileSync(temp_file_path, 'utf-8');
	return content;
}

// Read File Path Data
// 
// depth 5 以上はスキップなどでもいいか ?
// 　→ 一定階層以下は、getJSON で 随時 Append
// file_index が入った 謎 API は使わない方法考えるべきか....
//
function readFiles(file_path, file_index, file_depth, file_result, is_directory, parent_file_index=1, is_root_file=0){
	if ( file_depth == 1 && file_index == 1 ) { index_number = 0; console.log("init index") }
	files_array = []; indexed_file_hash = {};
	// その他、file_path の security 対策が必要。
	file_path = checkAndReturnPath(file_path); // 
	var file_path_check = fs.existsSync(file_path);
	if (is_root_file == 1) { original_file_path_len = checkFileOrginalDepth(file_path); }
	var banned_file_array  = [".git", ".gitignore"];
	// console.log("generated file ", file_path, " is ", file_path_check);
	if ( file_path_check == false ) { return [file_result, indexed_file_map] }
	fs.readdirSync(file_path).forEach( function(file) {
		if ( file_depth == 1 && banned_file_array.includes(file) == true ) { return; }
		if ( file_path == "./" ) {
			if ( file == "files" || file == "temp_files" ) {
				return;
			}
		}
		var each_file_path = file_path + file + "/";
		file_depth_split   = each_file_path.split("/").filter(item => item != "");
		file_depth 		   = file_depth_split.length - original_file_path_len;
		// file_depth = each_file_path.split("/").length - 2;
		file_index += file_depth == 1 ? 1 : 0;
		index_number += 1;
		if (file_depth == 1){
			indexed_file_map[file_index] = index_number
		}
		// 現段階で、Ajax 実装できていない....
		if ( file_depth >= 6 ) {
			// console.log(each_file_path, "exceed file depth 6. quit.");
		} else {
			// @ Check Accessability
			// fs.access(each_file_path, fs.constants.R_OK, (err) => {
			// 	  var is_accessable = err ? false : true
			// })
			// 
			// @ Try Catch
			// try { file_ls_stat = fs.lstatSync } catch (err) { file_ls_stat = false }
			// 
			// @ Check File Existance
			// if ( fs.existsSync(each_file_path) == false ) { continue }
			var each_file_stat;
			try {
				each_file_stat = fs.lstatSync(each_file_path);
				if (each_file_stat.isDirectory()) {
					file_result.push([file, file_index, file_depth, 0, index_number, parent_file_index]);
					readFiles(each_file_path, file_index, file_depth, file_result, 0, index_number, 0);
				} else {
					file_result.push([file, file_index, file_depth, 1, index_number, parent_file_index]);
				}
			} catch (err) {
				console.log(err);
			}
		}
	});
	console.log("original ", file_path, " file depth is ", original_file_path_len);
	return [file_result, indexed_file_map, file_path];
}

// Read Modal Data
function readModal(){
	var modal_file_path = "public/files/html/modal.html"
	var modal_content = fs.readFileSync(modal_file_path, 'utf-8');
	return modal_content
}
// 
// function to generate file
function generateFile(file_path, file_content){
	// Generate Checck
	console.log("Original Path:" + file_path);
	// .. // の対策
	var fixed_file_path = common_functions.replaceAll(file_path, "..", ".");
	fixed_file_path = common_functions.replaceAll(fixed_file_path, "//", "/");
	fixed_file_path = generate_file_path(fixed_file_path, 0);
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

// function to generate temp file
function generateTempFile(file_path, file_content){
	// Generate Check
	var fixed_file_path = common_functions.replaceAll(file_path, "..", ".");
	fixed_file_path 	= common_functions.replaceAll(fixed_file_path, "//", "/");
	fixed_file_path     = generate_file_path(fixed_file_path, 1);
	var file_path_splited  = fixed_file_path.split("/");
	var file_len = file_path_splited.length;
	var shorten_file_path_folder = "temp_files/user_name/" + file_path_splited.slice(2, file_len-1).join("_");
	var shorten_file_path_file   = file_path_splited.slice(file_len-1, file_len);
	var shorten_file_path  = shorten_file_path_folder + "/" + shorten_file_path_file;
	var is_file_exist   = fs.existsSync(fixed_file_path);
	// Generate Folder If file is not exist.
	if ( is_file_exist == false ) {
		// var fixed_folder_path = fixed_file_path_splitted.slice(0, fixed_file_path_splitted.length-1).join("/");
		console.log("Folder Path:" + shorten_file_path_folder);
		fs.mkdirSync(shorten_file_path_folder, { recursive: true });
	}
	// Generate | Update File
	var writeStream = fs.createWriteStream(shorten_file_path);
	writeStream.on('error', err => console.log('error', err.message));
	writeStream.on('finish', () => console.log('finish'));
	writeStream.write(file_content);
	writeStream.end();
	return shorten_file_path;
}

function checkGeneratedFilePath(file_path, is_temp=0){
	// 
	g_file_path = generate_file_path(file_path, is_temp);
	console.log("checking " + g_file_path + " exist or not...");
	var is_file_exist = fs.existsSync(g_file_path);
	return is_file_exist
}

function checkGeneratedFileName(file_path, is_temp=0){
	// 
	var file_path_format  = (is_temp == 1) ? "temp_files/user_name/" : "files/user_name/";
	var is_file_generated = (file_path.slice(0, 16) == file_path_format && file_path.length >= 18);
	return is_file_generated
}

function generate_file_path(file_path, is_temp=0){
	// example file path => "/files/user_name/[path]"
	// @ should block malicious input
	// @ can implement sessions or user login system
	var file_path_format  = (is_temp == 1) ? "temp_files/user_name/" : "files/user_name/";
	var is_file_generated = checkGeneratedFileName(file_path, is_temp);
	var result_file_path  = is_file_generated ? file_path : common_functions.replaceAll((file_path_format + file_path), "//", "/");
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

function checkPath(file_path){
	// 
	console.log(file_path);
	var fixed_file_path = common_functions.replaceAll(file_path, "..", ".");
	fixed_file_path     = common_functions.replaceAll(fixed_file_path, "//", "/");
	var is_file_exist = fs.existsSync(fixed_file_path);
	if ( is_file_exist == true ) {
		return true;
	} else {
		return false;
	}
}

function ReadFullFile(file_path, file_array, file_limit=100){
	// 
	if ( file_limit == 0 ) { return file_array }
	var all_contents  = fs.readdirSync(file_path);
	if ( all_contents.length > 20 ) { file_limit = 2 }
	var is_file_exist; var gen_file_path;
	// file limit ...
	all_contents.forEach(function(content){
		var gen_file_path = file_path + "/" + content;
		is_file_stats 	  = fs.lstatSync(gen_file_path);
		var is_file_dir   = is_file_stats.isDirectory();
		if ( is_file_dir ) {
			var next_file_limit = file_limit - 1;
			file_array = ReadFullFile(gen_file_path, file_array, next_file_limit);
		} else {
			// 
			file_array.push(gen_file_path);
		}
	});
	return file_array
}

function checkAndReturnPath(file_path){
	// . や / が複数ある場合は ...?
	var fixed_file_path = common_functions.replaceAll(file_path, "..", ".");
	fixed_file_path   = common_functions.replaceAll(fixed_file_path, "//", "/");
	console.log(fixed_file_path);
	var fixed_file_path_splitted  = fixed_file_path.split("/");
	var permitted_folder_path_array = ["files", "temp_files"];
	if (permitted_folder_path_array.includes(fixed_file_path_splitted[1]) == false){
		return fixed_file_path;
	} else {
		return "/"
	}
}

function checkFileOrginalDepth(file_path){
	// 
	var check_file_path = file_path;
	// if ( file_path.slice(0, 2) == "C:" ) { check_file_path = file_path.slice(2); }
	var check_file_path_splitted = check_file_path.split("/");
	check_file_path_splitted = check_file_path_splitted.filter(item => item != "");
	return check_file_path_splitted.length
}

// Save Indexed JSON

function saveFileIndexJson(file_path){
	var file_arrays = []; var result_file_arrays = []; var file_content = "";
	var file_extension_array = ["html", "css", "js"];
	var analyzed_html_file; var analyzed_css_file; var analyzed_js_file;
	var all_contents  = fs.readdirSync(file_path).length;
	result_file_arrays = ReadFullFile(file_path, file_arrays);
	var result_file_arrays_len = result_file_arrays.length;
	var result_file_arrays_len_percent = Math.round(result_file_arrays_len / 10);
	result_file_arrays.forEach(function(file_path_ele, index){
		// 
		if ( index % result_file_arrays_len_percent == 0 ) {
			var result_percent = index / result_file_arrays_len_percent * 10;
			console.log("File read ", result_percent, "% ...");
		}
		var extension_name = file_path_ele.split(".").slice(-1)[0];
		extension_name = (extension_name != undefined) ? common_functions.replaceAll(extension_name, "/", "") : "";
		if ( file_extension_array.includes(extension_name) ) {
			// eval たぶん 危険じゃない ... ?
			var file_content = fs.readFileSync(file_path_ele, "utf-8");
			var var_name = "analyzed_" + extension_name + "_file";
			var file_analyze_code 	= var_name + " = simple_indexer.analyze_" + extension_name + "_file(file_content, file_path_ele, " + var_name + ");";
			eval(file_analyze_code);
		}
	});
	console.log("@", file_path, " contains ", result_file_arrays.length, "files.");
	common_functions.generate_file_json(analyzed_js_file, "js_indexed", "js");
	common_functions.generate_file_json(analyzed_css_file, "css_indexed", "css");
	common_functions.generate_file_json(analyzed_html_file, "html_indexed", "html");
	return { "indexed_js" : analyzed_js_file, "indexed_html" : analyzed_html_file, "indexed_css" : analyzed_css_file };
}

function execSaveFileIndexJsoniWthTime(file_path){
	// 
	var index_result;
	new Promise ((resolve, reject) => {
		index_result = common_functions.getFunctionTime(saveFileIndexJson, file_path);
		resolve(index_result);
	}).then(function(exec_result){
		// console.log("@Save Function ", Object.keys(index_result));
	});
	return index_result; 
}

// saveFileIndexJson(".");

// Read File
module.exports.read_files 	  = readFiles;
module.exports.read_file  	  = readFile;
module.exports.modal_file 	  = readModal;
module.exports.read_tempfile  = readTempfile;
// Generate file
module.exports.generate_file  = generateFile;
module.exports.generate_temp_file	= generateTempFile;
// Generate Json index file
module.exports.exec_save_file_index_json = execSaveFileIndexJsoniWthTime;
// Default
module.exports.check_path	  = checkPath;
