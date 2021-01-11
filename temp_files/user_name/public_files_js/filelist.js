// 

var current_index = 0;
var tabs = new Tabs([]);

function draw_filelist (array, file_indexed) {
	var editor_file = document.getElementById("file-editor-folder-inner-section");
	var new_file    = document.createElement("p");
	new_file.innerHTML = "　<a href='javascript:gen_new_file()'><img src='files/image/plusbutton_87904.png' style='height:10px'> 新規ファイル作成</a>";
	new_file.classList.toggle("shown-file");
	editor_file.append(new_file);
	array.forEach( function(item) {
		var l_li = document.createElement('p');
		l_blank = "　".repeat(item[2]);
		l_image = item[3] == 1 ? "<img src='files/image/600px-File_font_awesome.svg.png' style='height:10px'> " : "<img src='files/image/Font_Awesome_5_regular_folder.svg' style='height:10px'> "
		l_li.innerHTML = l_blank + l_image + item[0];
		l_li.setAttribute("index", item[1]);
		l_li.setAttribute("depth", item[2]);
		l_li.setAttribute("file", item[3]);
		l_li.setAttribute("number", item[4]);
		l_li.setAttribute("parent", item[5]);
		l_li.onclick = function () {
			child_result = search_child(array, item[0], item[4], item[5], item[3]);
		}
		if ( item[2] == 1 ) {
			l_li.classList.toggle("shown-file");
			editor_file.append(l_li);
		} else {
			l_li.classList.toggle("hidden-file");
			editor_file.append(l_li);
		}
	})
}

function search_child (array, path, current_id, parent_id, file_bool){
	console.log(path);
	if (file_bool == 0) {
		console.log("showing " + current_id + "....");
		var editor_file = document.getElementById("file-editor-folder-inner-section");
		var editor_p = editor_file.getElementsByTagName("p");
		filter_array = array.filter( item => ( item[5] == current_id ) );
		show_filelist(filter_array, editor_p);
		editor_p[current_id].onclick = "";
		editor_p[current_id].onclick = function() {
			// 
			hide_filelist(array, current_id);
		}
	} else {
		// update previous(current) tab content
		//   - get file content
		//   - create file
		//	 - get path
		//
		// update previous(current) tab content
		var is_temp_file = true;
		update_tab_editor_data(fileEditor, tabs, tabs.focus_file, "", false, "");
		file_content_path = "/file?filename=" + path + "&filenumber=" + parent_id;
		var is_new_tab = false;
		// check for writing file...
		// quite a bit ugly codes ...
		var tab_file_name     = get_fullpath(files_array, current_id);
		var is_tab_file_exist = tabs.tab_array_main.indexOf(tab_file_name);
		if ( is_tab_file_exist == -1 ) {
			tabs.focus_file += (tabs.tab_array_main.length > 0) ? 1 : 0;
			tabs.tab_array_main.push(tab_file_name);
			is_new_tab = true;
		}
		tabs.tab_is_writing = -1;
		tabs.tab_writing_count_array[tab_file_name]   = 0;
		tabs.tab_writing_updated_array[tab_file_name] = 1;
		$.getJSON(file_content_path, function(json){
			fileEditor.setValue(json["file_content"]);
		})
		// new Promise((resolve, reject) => {
		// 	tabs.show_tab_data_by_count(tab_file_name);
		// 	resolve();
		// })
		.then(function(){
			// return to the original array.
			// quite a bit ugly codes ...
			if ( is_new_tab == true ) {
				var tab_main_len = tabs.tab_array_main.length - 1;
				tabs.tab_array_main = tabs.tab_array_main.slice(0, tab_main_len);
			}
			tabs.add_tab(current_id, parent_id);
		});
	}
}

function show_filelist(result, e_p){
	// 
	result.forEach( function(item) {
		var i = item[4];
		e_p[i].classList.remove("hidden-file");
		e_p[i].classList.add("shown-file");
	});
}

function hide_filelist(array, current_id){
	// 
	var editor_file = document.getElementById("file-editor-folder-inner-section");
	var editor_p = editor_file.getElementsByTagName("p");
	var hide_files  = array.filter( item => ( item[5] == current_id ) );
	console.log(hide_files);
	// hide_files.forEach( function(item) {
	// 	var i = item[4]-1;
	// 	editor_p[i].classList.remove("shown-file");
	// 	editor_p[i].classList.add("hidden-file");
	// } );
	hide_all_child_filelist(array, current_id, editor_p);
	editor_p[current_id].onclick = "";
	editor_p[current_id].onclick = function() {
		// 
		search_from_current_id(array, current_id);
	}
}

function search_from_current_id(array, current_id){
	// 
	item = array.filter(ite => ite[4] == current_id )[0];
	search_child(array, item[0], item[4], item[5], item[3]);
}

function hide_all_child_filelist(array, current_id, e_p){
	// 
	var current_file = array.filter(item => item[4] == current_id)[0];
	if (current_file[3] == 0){
		var child_file 	 = array.filter(item => item[5] == current_file[4]);
		for( var i = 0; i < child_file.length; i++ ){
			if ( child_file[i][3] == 0 ){
				hide_all_child_filelist(array, child_file[i][4], e_p);
			}
			var child_id = child_file[i][4];
			e_p[child_id].classList.remove("shown-file");
			e_p[child_id].classList.add("hidden-file");
		}
	}
}

function get_fullpath(array, current_id){
	// 
	var current_file   = array.filter(item => item[4] == current_id )[0]
	var file_fullpath  = current_file[0];
	var file_count     = 0;
	while ( current_file[2] != 1 ) {
		// 
		if (file_count == 20) { break; console.log("exceed 20") }
		prev_id      = current_file[5];
		current_file = array.filter(item => item[4] == prev_id )[0];
		if (current_file != undefined) {
			file_fullpath = current_file[0] + "/" + file_fullpath
		}
		file_count += 1
	}
	return file_fullpath
}

function gen_new_file(){
	// 
	fileEditor.setValue("");
	tabs.add_blank_tag();
}

// setTimeout(function(){
// 	update_file_content_every_minute(fileEditor, tabs, "");
// }, 5000);