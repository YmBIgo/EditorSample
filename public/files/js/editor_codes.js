// 
// ToDo List
// 	 1 : onmouse_over position
//   2 : add editor_set_onmouseover @ tab file
// 

function editor_set_onmouseover(){
	var current_editor = document.getElementsByClassName("cm-s-default")[0];
	// cm-def | cm-string ? | cm-variable | cm-property
	var cm_array 	= ["cm-def", "cm-string", "cm-variable", "cm-property"];
	for ( var i = 0; i < cm_array.length; i++ ) {
		// 
		var current_cm = current_editor.getElementsByClassName(cm_array[i]);
		set_onmouseover_to_ele(current_cm, current_editor);
	}
}

function set_onmouseover_to_ele(eles, editor){
	// 
	var current_ele;
	var editor_top  = editor.offsetTop; var editor_left = editor.offsetLeft;
	for ( var i = 0; i < eles.length; i++ ) {
		current_ele = eles[i];
		current_ele.onmouseover = (event) => {
			// index_result_response
			// 
			// var old_on_mouseover_ele = document.getElementsByClassName("on_mouseover_ele");
			// if ( old_on_mouseover_ele.length > 0 ) { return false }
			var mouseover_ele_text	= current_ele.innerText;
			var searched_index 		= searchRelativeText(mouseover_ele_text);
			if ( searched_index == false ) { return false }
			var on_mouseover_ele = document.createElement("div");
			on_mouseover_ele.classList.add("on_mouseover_ele");
			var mouse_top 		 = event.clientY - editor_top ;
			var mouse_left		 = event.clientX - editor_left;
			var file_response_index_text = "<h5 class='onmouseover_ele_title'>Definition</h5><p>";
			on_mouseover_ele.innerHTML 	= file_response_index_text;
			searched_index.forEach(function(item){
				// 
				var br_ele 		 = document.createElement("br");
				on_mouseover_ele.appendChild(item);
				on_mouseover_ele.appendChild(br_ele);
			})
			editor.appendChild(on_mouseover_ele);
			on_mouseover_ele.style.top 	= mouse_top + "px";
			on_mouseover_ele.style.left = mouse_left + "px";
			on_mouseover_ele.setAttribute("mouse_top", mouse_top);
			on_mouseover_ele.setAttribute("mouse_left", mouse_left);
			on_mouseover_ele.onmouseover = (event) => {
				// 
			}
			on_mouseover_ele.onmouseleave = (event) => {
				var old_onmouseover_ele = editor.getElementsByClassName("on_mouseover_ele")[0];
				editor.removeChild(old_onmouseover_ele);
			}
		}
		current_ele.onmouseleave = (event) => {
			// 
			var old_onmouseover_ele = editor.getElementsByClassName("on_mouseover_ele")[0];
			var old_ele_top  = parseInt(old_onmouseover_ele.getAttribute("mouse_top"));
			var old_ele_left = parseInt(old_onmouseover_ele.getAttribute("mouse_left"));
			if ( event.clientY < old_ele_top + editor_top || event.clientX < old_ele_left + editor_left ) {
				editor.removeChild(old_onmouseover_ele);
			}
		}
	}
}

function searchRelativeText(tab_text) {
	// 
	var current_extension = tabs.tab_array_main[tabs.focus_file].split(".").slice(-1)[0]
	var file_extension_array = ["js", "css", "html"];
	var indexed_extension_name; var file_response_source;
	var file_response_index; var file_response_index_inner;
	var file_response_index_array = [];
	if ( file_extension_array.includes(current_extension) == false ) {
		return false
	} else {
		indexed_extension_name	= "indexed_" + current_extension;
		file_response_source 	= index_result_response["files_paths"][indexed_extension_name];
	}
	if (current_extension == "js") {
		var file_response_variable_index    = file_response_source["variable"][tab_text];
		var file_response_function_index    = file_response_source["function"][tab_text];
		// have not implemented class
		if ( file_response_variable_index == undefined ) { file_response_variable_index = []; }
		if ( file_response_function_index == undefined ) { file_response_function_index = []; }
		file_response_index 	= file_response_function_index.concat(file_response_variable_index);
	} else if (current_extension == "css") {
		// 
		var file_response_css_index 			= file_response_source[tab_text];
		if ( file_response_css_index == undefined ) { file_response_css_index = [] }
		file_response_index = file_response_css_index;
	} else if (current_extension == "html") {
		// 
		var file_response_id_index 			= file_response_source["id"][tab_text];
		var file_response_class_index		= file_response_source["class"][tab_text];
		if ( file_response_id_index == undefined )    { file_response_id_index = []; }
		if ( file_response_class_index == undefined ) { file_response_class_index = []; }
		file_response_index 	= file_response_id_index.concat(file_response_class_index);
	} else {
		// can imple ruby or python or other languages
		return false
	}
	if ( file_response_index.length == 0 ) { return false }
	file_response_index.forEach(function(item){
		// 
		file_response_index_inner = item[0].replace("//", "/") + ":" + item[1];
		var file_response_index_p = document.createElement("a");
		file_response_index_p.innerText = file_response_index_inner;
		file_response_index_p.onclick = (event) => {
			display_small_snipet(item[0].replace("//", "/"), item[1], event)
		}
		file_response_index_array.push(file_response_index_p);
	});
	return file_response_index_array;
}

function display_small_snipet(file_path, line_num, event){
	// 
	var current_editor	= document.getElementsByClassName("cm-s-default")[0];
	var current_mouseover_ele = current_editor.getElementsByClassName("on_mouseover_ele")[0];
	var current_top 	= current_mouseover_ele.getAttribute("mouse_top") + "px";
	var current_left	= current_mouseover_ele.getAttribute("mouse_left") + "px";
	var all_file_ele	= file_path.replace("./", "").split("/")
	var file_ele_length = all_file_ele.length;
	console.log(file_path, file_ele_length);
	var file_ele 		= files_array.filter(item => item[0] == all_file_ele.slice(-1) && item[2] == file_ele_length )[0];
	var json_file_path 	= "/file?filename=" + file_ele[0] + "&filenumber=" + file_ele[5];
	var file_content	= ""; var file_line_content = [];
	current_editor.removeChild(current_mouseover_ele);
	$.getJSON(json_file_path, function(json){
		file_content = json["file_content"];
		console.log(file_content.slice(0, 100));
	})
	.then(function(){
		// 
		// file_line_content 	= file_content.split("\n").slice(line_num - 5, line_num + 5);
		// file_content 		= file_line_content.join("\n");
		var mouseover_small_code_snipet  = document.createElement("div");
		mouseover_small_code_snipet.classList.add("code_snippet_ele");
		console.log(mouseover_small_code_snipet);
		current_editor.appendChild(mouseover_small_code_snipet);
		mouseover_small_code_snipet.style.top  = current_top;
		mouseover_small_code_snipet.style.left = current_left;
		var codemirror_small_code_snippet = document.createElement("textarea");
		codemirror_small_code_snippet.setAttribute("id", "codemirrorCodeSnippet");
		mouseover_small_code_snipet.appendChild(codemirror_small_code_snippet);
		var snippet_tag = CodeMirror.fromTextArea(codemirrorCodeSnippet, {
			lineNumbers: true
		});
		snippet_tag.setSize(360, 240);
		snippet_tag.setValue(file_content);
		mouseover_small_code_snipet.onmouseleave = (event) => {
			var old_onmouseover_code_snippet = document.getElementsByClassName("code_snippet_ele")[0];
			current_editor.removeChild(old_onmouseover_code_snippet);
		}
	});
}