// test
// 
var fs = require("fs");
var index_number = 0;
var indexed_file_map = new Map();
function readFiles(file_path, file_index, file_depth, file_result, is_directory, parent_file_index=1){
	files_array = [];
	fs.readdirSync(file_path).forEach( function(file) {
		var each_file_path = file_path + file + "/";
		file_depth = each_file_path.split("/").length - 2;
		file_index += file_depth == 1 ? 1 : 0;
		index_number += 1;
		if (file_depth == 1){
			console.log(index_number);
			indexed_file_map[file_index] = index_number
		}
		if (fs.lstatSync(each_file_path).isDirectory()) {
			file_result.push([each_file_path, file_index, file_depth, 0, index_number, parent_file_index]);
			readFiles(each_file_path, file_index, file_depth, file_result, 0, index_number);
		} else {
			file_result.push([each_file_path, file_index, file_depth, 1, index_number, parent_file_index]);
		}
	});
	return [file_result, indexed_file_map];
}
file_array  = [];
[file_result, indexed_file_map] = readFiles("./", 0, 0, file_array ,0, 1);

console.log(file_result)
// file_search_result = file_result.filter( item => ( item[1] == 4 && item[2] == 2 ) )
// console.log(file_search_result)