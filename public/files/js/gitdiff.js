
function generate_line_length_array(e_array){
	e_num = 0; result_array = [];
	e_array.forEach(function(s_line){
		e_num += s_line.length;
		result_array.push(e_num)
	})
	return result_array;
}

function generate_git_diff_content(before_editor, after_editor){

	before_editor_lines = before_editor.split("\n")
	after_editor_lines  = after_editor.split("\n")

	git_unified_array = difflib.unifiedDiff(before_editor_lines, after_editor_lines);
	git_unified_array_start_index = git_unified_array.findIndex(element => element.slice(0, 2) == "@@")
	git_unified_array = git_unified_array.slice(git_unified_array_start_index+1)

	return [before_editor, after_editor, git_unified_array]

}

function update_git_diff_color_line(js_editor){
	js_editor.eachLine(function(js_line2, index){
		// editor_array.push(js_line2)
		if (js_line2.text.slice(0, 1) == "-"){
			js_editor.addLineClass(js_line2, null, 'delete-code')
		} else if (js_line2.text.slice(0, 1) == "+"){
			js_editor.addLineClass(js_line2, null, 'changed_code')
		}
	});
	return js_editor
}

function generate_git_diff_code(before_editor, after_editor){
	// gitdiff = new difflib.SequenceMatcher(null, before_editor, after_editor).getOpcodes()
	[before_editor_lines, after_editor_lines, git_unified_array] = generate_git_diff_content(before_editor, after_editor)
	document.getElementById("editor_js2").value = git_unified_array.join("\n");

	var jsEditor2 = CodeMirror.fromTextArea(document.getElementById('editor_js2'), {
	    mode: "javascript",
	    lineNumbers: true,
	    indentUnit: 4
	});

	jsEditor2 = update_git_diff_color_line(jsEditor2);
	fix_git_diff_lines(git_unified_array);
	return [jsEditor2, git_unified_array]
}

function calc_git_diff_lines(gitdiff_array){
	before_line_index = 0; after_line_index = 0;
	index_array = []
	gitdiff_array.forEach(function(gitdiff_line){
		if (gitdiff_line[0] == "+"){
			// 
			before_line_index += 1;
			index_line = "   " + String(before_line_index);
		} else if (gitdiff_line[0] == "-"){
			//
			after_line_index += 1;
			index_line = String(after_line_index) + "　 "
		} else{
			before_line_index += 1; after_line_index += 1;
			index_line = String(after_line_index) + " " + String(before_line_index)
		}
		index_array.push(index_line);
	});
	return index_array
}

function fix_git_diff_lines(gitdiff_array){
	code_section = document.getElementsByClassName("CodeMirror-sizer")[2]
	code_gutters = code_section.getElementsByClassName("CodeMirror-gutter-elt");
	code_gutters_data = calc_git_diff_lines(gitdiff_array);
	// console.log(code_gutters, code_gutters_data);
	Array.prototype.forEach.call(code_gutters, function(gutter, index){
		gutter.innerText = code_gutters_data[index]
	});
	return code_gutters;
}

function update_git_diff_code(before_editor, after_editor, js_editor){
	[before_editor_lines, after_editor_lines, git_unified_array] = generate_git_diff_content(before_editor, after_editor);
	js_editor.setValue(git_unified_array.join("\n"));
	js_editor = update_git_diff_color_line(js_editor);
	return git_unified_array
}

function onchange_update_jseditor2(jseditor, jseditor1, jseditor2){
	jseditor2.clearHistory();
	document.getElementById("editor_js1").value = jseditor1.getValue();
	// CodeMirror/src/display/operations.js の 61行目
	// 　updateDisplayIfNeeded → patchdata
	// 4310 ~ 4316 にバッチ
	[before_editor_lines, after_editor_lines, git_unified_array] = generate_git_diff_content(jseditor.getValue(), jseditor1.getValue());
	var gitdiff_result = calc_git_diff_lines(git_unified_array);
	jseditor2.isOnChange = "fix_git_diff";
	jseditor2.gitdiff_result = gitdiff_result;
	jseditor2.setValue(git_unified_array.join("\n"));
	update_git_diff_color_line(jseditor2);
}