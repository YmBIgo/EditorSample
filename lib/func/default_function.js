// 
var fs = require("fs");

function generate_file_json(file_array, file_path, file_type="html"){
	// 
	var file_json 		  = JSON.stringify(file_array);
	var file_path_for_gen = replaceAll(file_path, '/', '_');
	file_path_for_gen 	  = replaceAll(file_path_for_gen, '.', '');
	// json_files の pass ビミョウ ...
	file_path_for_gen	  = "./json_files/" + file_type + "_" + file_path_for_gen + ".json";
	try {
		fs.writeFileSync(file_path_for_gen, file_json);
		console.log("Successfully writes file... ", file_path);
	} catch(err) {
		console.error(err);
	}
}

function replaceAll(original_string, reg, text){
	// 
	var original_string_array  = original_string.split(reg);
	var result_original_string = original_string_array.join(text);
	return result_original_string
}

function getFunctionTime(func, ...args){
	var d1; var d2; var func_result;
	var get_function_time = new Promise((resolve, reject) => {
		d1 = new Date();
	// }).then(function(){
		func_result = func(args[0]); // 0 が びみょい ...
		resolve(d1);
	}).then(function(){
		d2 = new Date();
		var diff_time = d2 - d1;
		console.log("Function [", func.name, "] Time ", diff_time, "ms");
		// console.log("getTime Finish ", Object.keys(func_result));
	});
	return func_result
}

module.exports.replaceAll 			= replaceAll;
module.exports.getFunctionTime 		= getFunctionTime;
module.exports.generate_file_json 	= generate_file_json;