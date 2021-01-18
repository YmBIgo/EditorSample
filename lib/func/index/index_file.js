// 
var fs = require("fs");
var common_functions = require("../default_function");

// html css js の スニペット 編集用の Index 作成

function analyze_css_file(file_content, file_path, css_file_hash={} ){
	// Output Image
	// 	 Class|ID ごとで、Start行数|End行数表示。
	// 
	var splitted_css_file = file_content.split("\n");
	// flags
	var is_css_file_start = false;
	var selector_name	  = "";
	// regexp
	var start_line_regexp = /([\.#]*[\w\-]+)\s*\{/;
	var end_line_regexp	  = /\}/;
	// result_hash
	var css_result_hash	  = css_file_hash;
	var css_return_hash	  = {};
	// Or consider 
	splitted_css_file.forEach( function (file_line, index) {
		// 
		if ( is_css_file_start == false ) {
			var start_line_result = file_line.match(start_line_regexp);
			if ( start_line_result != null ) {
				is_css_file_start = true;
				selector_name     = start_line_result[1]
				if ( css_result_hash[selector_name] == undefined ) {
					css_result_hash[selector_name] = []
				}
				css_result_hash[selector_name].push([file_path, index+1]);
			}
		}
		if ( is_css_file_start == true ) {
			var end_line_result   = file_line.match(end_line_regexp);
			if ( end_line_result   != null ) {
				is_css_file_start = false;
				// css_result_hash[selector_name].push([[file_path, index+1]]);
				selector_name = "";
			}
		}
	});
	// 
	css_return_hash		= css_result_hash;
	// generate_file_json(css_return_hash, file_path, "css");
	return css_return_hash;
}

function analyze_html_file(file_content, file_path, html_file_hash={"id":{}, "class":{}} ){
	// [ Input ]
	// 
	// [ Output Image ]
	// 	 => class / id  
	// 
	var splitted_html_file 		= file_content.split("\n");
	var class_names				= "";
	var id_names				= "";
	var class_names_array		= [];
	var id_names_array			= [];
	// flag
	var script_flag				= false;
	var style_flag				= false;
	// regexp
	var class_attribute_regexp 	= /class\=[\"\']([\w\-\s]+)[\"\']/;
	var id_attribute_regexp		= /id\=[\"\']([\w\-\s]+)[\"\']/;
	// array
	var class_result_hash		= html_file_hash["class"];
	var id_result_hash			= html_file_hash["id"];
	var html_return_hash 		= {};
	// 
	splitted_html_file.forEach( function (file_line, r_index) {
		// 
		if ( script_flag == false && style_flag == false ) {
			// 
			var class_line_regexp 	= file_line.match(class_attribute_regexp);
			var id_line_regexp 		= file_line.match(id_attribute_regexp);
			if ( class_line_regexp != null ) {
				class_names 		= class_line_regexp[1];
				class_names_array	= class_names.split(" ");
				class_names_array.forEach( function(class_name, index) {
					// 
					class_result_hash[class_name] = [[file_path, r_index+1]];
				});
			}
			if ( id_line_regexp != null ) {
				id_names 		= id_line_regexp[1];
				id_names_array 	= id_names.split(" ");
				id_names_array.forEach( function(id_name, index) {
					// 
					if ( id_result_hash[id_name] != undefined ) {
						id_result_hash[id_name].push([file_path, r_index+1]);
					} else { 
						id_result_hash[id_name] = [[file_path, r_index+1]];
					}
				});
			}
		} else if ( script_flag == true ) {
			// 
			// [Example]
			// <script type="text/javascript">
			// 		funtion hoge { hoge; }
			// </script>
			// 
			var script_tag_start_check  = file_line.match("<script");
			var script_tag_end_check	= file_line.match("</script");
			if ( script_tag_start_check != null && script_tag_end_check != null ) {
				// 
			} else if ( script_tag_start_check != null ) {
				// 一応 min とかじゃないか確認必要
				script_flag = true;
			} else if ( script_flag == true ) {
				// 文法に沿って...
			} else if ( script_tag_end_check != null && script_flag == true ) {
				script_flag = false;
			}
		} else if ( style_flag == true ) {
			// 
			// [Example]
			// <style>
			// 		hoge { hoge: hoge }		
			// </style>
			// 
			var style_tag_start_check	= file_line.match("<style");
			var style_tag_end_check		= file_line.match("</style");
			if ( style_tag_start_check != null && style_tag_end_check != null ) {
				// 一応 min とかじゃないか確認必要
			} else if ( style_tag_start_check != null ) {
				// 文法に沿って...
				style_flag = true;
			} else if ( style_flag == true ) {
				// 
			} else if ( style_tag_end_check != null && style_flag == true ) {
				style_flag = false;
			}
		}
	});
	html_return_hash	= { "class" : class_result_hash, "id" : id_result_hash } ;
	// generate_file_json(html_return_hash, file_path, "html");
	return html_return_hash;
}

function analyze_js_file(file_content, file_path, js_file_hash={"variable":{}, "function":{}, "class":{}}){
	// [ Output ]
	//   => Variables
	// 			var/let/const example [=] ["]["];
	// 	 => Defined Function
	// 			function example() {  }
	//   => Useing Function
	// 			hoge[.]example[(]fuga[,] hoge1[)]
	// 
	var splitted_js_file 			= file_content.split("\n");
	var variable_name 				= "";
	var defined_function_name		= "";
	var used_function_name	 		= "";
	var variable_name_array			= [];
	var defined_function_name_array = [];
	var used_function_name_array 	= [];
	// can (or should?) impl class list
	//   > { "class hoge" => ["func hoge1", "func hoge2"] } 
	// var class_name_array 			= [];
	// regexp 
	var variable_regexp				= /(var|const|let)\s+([\w\-]+)\s*\=\s*/;
	var defined_function_regexp		= /function\s*([\w\-]+)\s*\(/; // [\"\']{0,1}
	var defined_class_regexp		= /class\s*([\w\-])\s*\{/; // should detect close tag
	var comment_regex1 				= /\/\//;
	var comment_regex2_start		= /\/\*/;
	var comment_regex2_end			= /\*\//;
	// flag
	var is_comment2_flag			= false;
	// array
	var variable_result 			= js_file_hash["variable"];
	var defined_function_result		= js_file_hash["function"];
	var defined_class_result		= js_file_hash["class"];
	var javascript_result_hash 		= {};
	splitted_js_file.forEach( function (file_line, r_index) {
		// 
		var current_file_line = file_line;
		// Comment Out
		if ( is_comment2_flag == false ) {
			var is_comment1_line		= file_line.indexOf(comment_regex1);
			var is_comment2_start_line 	= file_line.indexOf(comment_regex2_start);
			if ( is_comment2_start_line != -1 ) {
				// 
				current_file_line = file_line.slice(0, is_comment2_start_line);
				is_comment2_flag  = true;
			} else if ( is_comment1_line != -1 ) {
				// 
				current_file_line = file_line.slice(0, is_comment1_line);
			}
		} else if ( is_comment2_flag == true ) {
			var is_comment2_end_line	= file_line.indexOf(comment_regex2_end);
			if ( is_comment2_end_line != -1 ) {
				// skip
				current_file_line = "";
			} else {
				// 
				current_file_line = file_line.slice(is_comment2_end_line);
				is_comment2_flag  = false;
			}
		}
		// Variable & Function & Used Function Check
		var variable_regexp_result 			= current_file_line.match(variable_regexp);
		var defined_function_regexp_result 	= current_file_line.match(defined_function_regexp);
		var defined_class_regexp_result		= current_file_line.match(defined_class_regexp);
		if ( variable_regexp_result != null ) {
			// 重複時の挙動 ...
			if (variable_result[variable_regexp_result[2]] == undefined || typeof variable_result[variable_regexp_result[2]] == "function" ) {
				variable_result[variable_regexp_result[2]] = []
			} 
			variable_result[variable_regexp_result[2]].push([file_path, r_index + 1]);
			// variable_result[variable_regexp_result[1]] = [r_index, file_path];
		} else if ( defined_function_regexp_result != null ) {
			// 
			if (defined_function_result[defined_function_regexp_result[1]] == undefined || typeof defined_function_result[defined_function_regexp_result[1]] == "function" ){
				defined_function_result[defined_function_regexp_result[1]] = []
			}
			defined_function_result[defined_function_regexp_result[1]].push([file_path, r_index + 1]);
		} else if ( defined_class_regexp_result != null ) {
			// should impl flag
			if (defined_class_result[defined_class_regexp_result[1]] == undefined) { defined_class_result[defined_class_regexp_result[1]] = [] }
			defined_class_result[defined_class_regexp_result[1]].push([file_path, r_index + 1]);
		}
	});
	javascript_result_hash	 = { "variable" : variable_result, "function" : defined_function_result, "class" : defined_class_result };
	// generate_file_json(javascript_result_hash, file_path, "js");
	return javascript_result_hash;
}

function generate_file_json(file_array, file_path, file_type="html"){
	// 
	var file_json 		  = JSON.stringify(file_array);
	var file_path_for_gen = common_functions.replaceAll(file_path, '/', '_');
	file_path_for_gen 	  = common_functions.replaceAll(file_path_for_gen, '.', '');
	// json_files の pass ビミョウ ...
	file_path_for_gen	  = "./json_files/" + file_type + "_" + file_path_for_gen + ".json";
	try {
		fs.writeFileSync(file_path_for_gen, file_json);
		console.log("Successfully writes file... ", file_path);
	} catch(err) {
		console.error(err);
	}
}

// Code Sample

// - Read File -
// var sample_js_file_path   = "./sample_files/load_file.js";
// var sample_css_file_path  = "./sample_files/style.css";
// var sample_html_file_path = "./sample_files/modal.html"
// var js_file_content		  = fs.readFileSync(sample_js_file_path, "utf-8");
// var css_file_content		  = fs.readFileSync(sample_css_file_path, "utf-8");
// var html_file_content	  = fs.readFileSync(sample_html_file_path, "utf-8");

// - Analyze File -
// var indexed_js_file		  = analyze_js_file(js_file_content, sample_js_file_path);
// var indexed_css_file 	  = analyze_css_file(css_file_content, sample_css_file_path);
// var indexed_html_file	  = analyze_html_file(html_file_content, sample_html_file_path);
// console.log(indexed_js_file);
// console.log(indexed_css_file);
// console.log(indexed_html_file);


// export function
module.exports.analyze_js_file 		= analyze_js_file;
module.exports.analyze_html_file 	= analyze_html_file;
module.exports.analyze_css_file 	= analyze_css_file;
module.exports.generate_file_json 	= generate_file_json;
