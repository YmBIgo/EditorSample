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
	var editor_top  = editor.offsetTop;
	var editor_left = editor.offsetLeft;
	for ( var i = 0; i < eles.length; i++ ) {
		current_ele = eles[i];
		current_ele.onmouseover = (event) => {
			// index_result_response
			// 
			var mouseover_ele_text	= current_ele.innerText;
			var searched_index 		= searchRelativeText(mouseover_ele_text);
			if ( searched_index == false ) { return false }
			console.log("mouse over @ ", mouseover_ele_text);
			var on_mouseover_ele = document.createElement("div");
			on_mouseover_ele.classList.add("on_mouseover_ele");
			console.log(event.clientX, event.clientY);
			var mouse_top 		 = event.clientY - editor_top ;
			var mouse_left		 = event.clientX - editor_left;
			on_mouseover_ele.innerHTML 	= searched_index;
			editor.appendChild(on_mouseover_ele);
			on_mouseover_ele.style.top 	= mouse_top + "px";
			on_mouseover_ele.style.left = mouse_left + "px";
			console.log(mouse_top, mouse_left);
		}
		current_ele.onmouseleave = (event) => {
			// 
			var old_onmouseover_ele = editor.getElementsByClassName("on_mouseover_ele")[0]
			var mouseover_ele_text = old_onmouseover_ele.innerText;
			console.log("mouse leaved.");
			editor.removeChild(old_onmouseover_ele);
		}
	}
}

function searchRelativeText(tab_text) {
	// 
	var current_extension = tabs.tab_array_main[tabs.focus_file].split(".").slice(-1)[0]
	var file_extension_array = ["js", "css", "html"];
	var indexed_extension_name; var file_response_source;
	var file_response_index; var file_response_index_text = "<h5 class='onmouseover_ele_title'>Definition</h5><p>";
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
		file_response_index_text += item[0] + ":" + item[1] + "\n";
	});
	file_response_index_text = file_response_index_text + "</p>";
	return file_response_index_text;
}