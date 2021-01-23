// 
var got    = require("got");
var jsdom  = require("jsdom");
const { JSDOM } = jsdom;
var crypto = require("crypto-js/md5");
var common_functions = require("./default_function");

function get_code_snippet_json(page_url, res) {
	// 
	var dom_result;
	var response_result;
	console.log(page_url);
	(async () => {
		try {
			const response = await got(page_url);
			response_result = response.body;
		} catch (error) {
			console.log(error);
		}
	})()
	.then(function(){
		// 
		dom_result = new JSDOM(response_result);
		var page_document = dom_result.window.document;
		var page_body	  = page_document.getElementsByTagName("body")[0];
		var search_result = common_functions.getFunctionTime(search_div_ele, page_body);
		res.send(search_result);
	})
}

function search_div_ele(page_document) {
	// 
	var search_tag_array = ["pre", "code", "textarea", "div"];
	var search_content_result = []; var search_each_result = {}; var prev_search_each_result = {};
	search_tag_array.forEach(function(search_tag){
		prev_search_each_result = search_each_tag_ele(page_document, search_tag, search_each_result);
		search_each_result 		= Object.assign(search_each_result, prev_search_each_result)
	});
	// console.log("Searched Classes", search_content_result);
	return search_each_result
}

function search_each_tag_ele(page_document, tag_ele, previous_search_hash){
	// 
	// code 改行が効かない場合がある....
	// 
	var page_divs = page_document.getElementsByTagName(tag_ele);
	// page_divs 内容追加する
	// get HTML info
	var page_div; var page_classlists; var page_class;
	var search_css_classes = []; var search_line_text; var search_line_text_array = [];
	var search_result_map  = {};  var search_result_map_key;
	var search_hash_array  = get_search_line_filehash_contents(previous_search_hash);
	for ( var i = 0; i < page_divs.length; i++ ) {
		var search_ele_bloc;
		var fixed_search_line_text_array = [];
		page_div = page_divs[i];
		var h_tag_check = search_h_and_a_tag(page_div);
		if ( h_tag_check == false ) { continue } // 常識的なコード コードスニペットに h1 ～ h3 なければいいが
		search_line_text = page_div.textContent;
		if ( search_line_text.length > 3000 ) { continue }
		// 
		search_line_text_array 	= search_line_text.split("\n");
		search_line_text_array 	= search_line_text_array.filter(item => item != "" );
		var first_search_line_text = format_html_text(search_line_text_array[0], false);
		if ( first_search_line_text == false ) { continue }
		// if ( first_search_line_text.length > 120 ) { continue }
		search_line_text_array.forEach(function(line_text){
			// 
			var formatted_line = format_html_text(line_text);
			var semicolon_regexp = /\;/gi;
			if (formatted_line != false) {
				var semicolon_num = formatted_line.match(semicolon_regexp); // split のほうがいい？
				var semicolon_num_len = (semicolon_num != null) ? semicolon_num.length : 0;
				if ( semicolon_num < 2 ) {
					fixed_search_line_text_array.push(line_text)
				} else {
					var for_loop_semicolumn_regexp = /for[\s]*\([a-zA-Z0-9\s\=\<\>\+\-\.\(\);]+\)/;
					if ( line_text.match(for_loop_semicolumn_regexp) != null ) {
						fixed_search_line_text_array.push(line_text);
					} else {
						var semicolumn_splitted_array 	= line_text.split(";");
						var check_start_bracket_regexp	= /\{[\s]*[^\n\}]+/;
						semicolumn_splitted_array = semicolumn_splitted_array.filter(item => item != " " && item != "" );
						semicolumn_splitted_array = semicolumn_splitted_array.map(item => item += ";" );
						semicolumn_splitted_array.forEach(function(semicolumn_splitted_ele){
							var is_start_bracket  = semicolumn_splitted_ele.match(check_start_bracket_regexp);
							if ( is_start_bracket == null ) {
								fixed_search_line_text_array.push(semicolumn_splitted_ele);
							} else {
								var before_bracket = semicolumn_splitted_ele.slice(0, is_start_bracket.index+1);
								var after_bracket  = semicolumn_splitted_ele.slice(is_start_bracket.index+1);
								fixed_search_line_text_array.push(before_bracket);
								fixed_search_line_text_array.push(after_bracket);
							}
						})
					}
				}
			}
		})
		search_line_text 		= fixed_search_line_text_array.join("\n");
		search_result_map_key   = tag_ele + i;
		search_result_map[search_result_map_key] = search_line_text;
	}
	// 
	var search_line_syntax_count_array = [];
	var search_line_syntax_count_hash  = {};
	var search_line_syntax_hash_array  = [];
	var search_result_keys = Object.keys(search_result_map);
	search_result_keys.forEach(function(search_map_id){
		var search_line = search_result_map[search_map_id];
		var search_line_text = search_line.split("\n");
		var search_line_syntax_count = [];
		var syntax_count;
		var syntax1_amount   = 0; var syntax2_amount = 0; var syntax_num = 0;
		// var not_including_alphabet = /[\w]/;
		var file_stripped    = search_line;
		var file_hashed 	 = crypto(file_stripped).toString();
		// check prev node
		var prev_formatted_content; var prev_ele_array; var fixed_prev_ele_array = [];
		var tag_name 	= search_map_id.match(/[a-zA-Z]+/)[0];
		var tag_number	= search_map_id.match(/\d+/)[0];
		var tag_ele 	= page_document.getElementsByTagName(tag_name)[tag_number];
		prev_ele_array 	= tag_ele.parentNode.textContent.split("\n");
		prev_ele_array  	= prev_ele_array.filter(item => item != "");
		prev_ele_array.forEach(function(prev_line_text){
			var prev_formatted_line = format_html_text(prev_line_text);
			if ( prev_formatted_line != false ) { fixed_prev_ele_array.push(prev_formatted_line) }
		})
		prev_formatted_content 		= fixed_prev_ele_array.join("\n");
		prev_formatted_content 		= common_functions.replaceAll(prev_formatted_content, /[\d]+[\n\t]*/, "");
		var prev_file_hashed 		= crypto(prev_formatted_content).toString();
		var is_file_already_exist = search_line_syntax_hash_array.includes(file_hashed);
		var is_prev_file_already_exist = search_line_syntax_hash_array.includes(prev_file_hashed);
		// 
		if ( is_file_already_exist == false && is_prev_file_already_exist == false ) { // search_line_text.length > 1
			search_line_syntax_hash_array.push(file_hashed);
			if ( search_line_text.length == 1 ) {
				if ( search_line_text[0].indexOf(";") != -1 ) {
					search_line_text = search_line_text[0].split(";");
					file_stripped 	 = search_line_text.join(";\n");
				}
			}
			search_line_text.forEach(function(search_text){
				// Code Check regexp
				// 	  1) { [ = ; (
				// 	  2) . , 
				// console.log(search_text);
				// var check_not_including_alphabet 	= search_text.search(not_including_alphabet);
				// 
				syntax_count = score_programming_text(search_text);
				syntax1_amount += syntax_count[0];
				syntax2_amount += syntax_count[1];
				syntax_num 	   += 1;
				search_line_syntax_count_array.push(syntax_count);
			});
		}
		var is_hash_exist_in_prev = search_hash_array.includes(file_hashed);
		var syntax1_average = syntax1_amount / syntax_num ;
		var syntax2_average = syntax2_amount / syntax_num ;
		if ( syntax1_average > 1 && is_hash_exist_in_prev == false ){
			search_line_syntax_count_hash[search_map_id] = {};
			// search_line_syntax_count_hash[search_map_id]["syntax_count"]  = search_line_syntax_count_array;
			search_line_syntax_count_hash[search_map_id]["syntax_hashed"]   = file_hashed;
			search_line_syntax_count_hash[search_map_id]["syntax1_count"]   = syntax1_amount;
			search_line_syntax_count_hash[search_map_id]["syntax2_count"]   = syntax2_amount;
			search_line_syntax_count_hash[search_map_id]["syntax1_average"] = syntax1_average;
			search_line_syntax_count_hash[search_map_id]["syntax2_average"] = syntax2_average;
			search_line_syntax_count_hash[search_map_id]["file_content"]    = file_stripped;
			// file_stripped   search_result_map[search_map_id]
		}
	});
	// console.log("[", tag_ele, "] Syntax Count : \n", search_line_syntax_count_hash);
	// console.log(" Syntax hash count : ", Object.keys(search_line_syntax_count_hash).length)
	return search_line_syntax_count_hash
}

function get_search_line_filehash_contents(search_hash){
	// 
	var search_hash_keys  = Object.keys(search_hash);
	if ( search_hash_keys == [] ) { return [] }
	var search_hash_array = []; var search_hash_content;
	search_hash_keys.forEach(function(search_key){
		search_hash_content = search_hash[search_key]["syntax_hashed"];
		search_hash_array.push(search_hash_content);
	});
	return search_hash_array;
}

function format_html_text(html_line, not_check_comment=true){
	// 
	if ( html_line == undefined ) { return false } // 本来はなら、filter で はじくべき
	var html_line_without_commentout;
	if ( not_check_comment == true ) {
		var commentout_position 		= html_line.match(/\/\*|\s\/\/|\<\!\-|\=begin|\=comment/);
		if (commentout_position != null) {
			html_line_without_commentout = html_line.slice(0, commentout_position);
		} else {
			html_line_without_commentout = html_line;
		}
	} else {
		html_line_without_commentout = html_line;
	}
	html_line_without_commentout 	= common_functions.replaceAll(html_line_without_commentout, /[\'\"]{1}[^\'\"]+[\'\"]{1}/, "");
	var not_alphabet_and_number		= html_line_without_commentout.match(/[^a-zA-Z0-9\t\s\[\]\{\}\(\)\'\"\.\+\-\=\/\^\\,!?:<>_+~#%$&@|;]{1}/gi); // 足りないのあるかも...
	// alphabet の 必要。
	// var alphabet_splitted_length 	= html_line_without_commentout.match(/[a-zA-Z0-9]{1}[\s]+[a-zA-Z0-9]/gi);
	var semicolon_length			= html_line_without_commentout.match(/\;/gi);
	var is_comment_line 			= html_line_without_commentout.match(/^[\n\t\/]+/);
	var check_only_number 			= html_line_without_commentout.match(/[^\d\s\t]+/);
	// var not_syntax_number			= html_line.match(/[^a-zA-Z\(\)\[\]\{\}\=\+\-\:*][\s]*[0-9]+/)
	// if ( alphabet_splitted_length == null ) { alphabet_splitted_length = [] }
	if ( not_alphabet_and_number == null ) { not_alphabet_and_number = [] }
	if ( semicolon_length == null ) { semicolon_length = [] }
	if ( check_only_number == null ) { return false }
	// alphabet_splitted_length と 調整が必要
	if ( not_alphabet_and_number.length < 5 ) { // alphabet_splitted_length.length < 3 && 
		return html_line
	}
	// }
	return false
}

function search_h_and_a_tag(search_content_ele){
	var h_tag_array = ["h1", "h2", "h3", "h4", "a", "script", "style"];
	for(var i = 0; i < h_tag_array.length; i++){
		var h_tag_name = h_tag_array[i]
		var h_tag = search_content_ele.getElementsByTagName(h_tag_name);
		if (h_tag.length > 0 ) { return false }
	}
}

function score_programming_text(text_line){
	// . { / [ ; 判定
	// アルファベット のみ 判定
	// 	  1) { [ = ; (
	// 	  2) . , 
	// 
	if ( text_line.length == 0 ) { return [-1, -1] }
	var syntax_word1 = ["{","}","[","]","=",";",":","(",")","<",">"];
	var syntax_word2 = [".", ","];
	var syntax_word1_count = 0;
	var syntax_word2_count = 0;
	// これより早いコードの書き方あるか ... ?
	[].forEach.call(text_line, function(word){
		if (syntax_word1.includes(word)) { syntax_word1_count += 1 }
		if (syntax_word2.includes(word)) { syntax_word2_count += 1 }
	})
	return [syntax_word1_count, syntax_word2_count]
}

module.exports.get_code_snippet_json	= get_code_snippet_json;