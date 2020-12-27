// 
class Tabs {
	constructor(tab_array, tab_number_array=[]){
		this.tab_array = tab_array;
		this.tab_number_array = tab_number_array; // 本来は constructor の 引数
		this.focus_file = 0;
		// 
	}
	add_tab(file_id, parent_id){
		var tab_file_name = get_fullpath(files_array, file_id);
		var selected_tab = this.tab_array.indexOf(tab_file_name);
		if (selected_tab == -1) {
			this.tab_array.push(tab_file_name);
			this.tab_number_array.push(parent_id);
		}
		this.focus_file = this.tab_array.indexOf(tab_file_name);
		this.display_tabs();
		// update previous(current) tab content
		update_tab_editor_data(fileEditor, tabs); // // 必要なら result_path 定義
		// --- code ---
	}
	add_blank_tag(){
		// update previous(current) tab content
		// --- code ---
		var blank_tab_name = this.create_new_blank_name()
		this.tab_array.push(blank_tab_name);
		this.display_tabs();
		fileEditor.setValue("");
	}
	create_new_blank_name(){
		// new_file
		var blank_tabs = this.tab_array.filter(item => item.slice(0, 8) == "new_file" );
		if ( blank_tabs == [] ) { return "new_file1" }
		var blank_numbers = blank_tabs.map(m => parseInt(m.slice(8)));
		var blank_i = 0;
		while ( blank_i++ < 20 ) {
			// 
			if (blank_numbers.includes(blank_i) == false) { break }
		}
		return "new_file" + blank_i
	}
	remove_tab(file_index){
		// update previous(current) tab content
		update_tab_editor_data(fileEditor, tabs); // // 必要なら result_path 定義
		// --- code ---
		var int_file_index = parseInt(file_index);
		var selected_tab   = this.tab_array[int_file_index];
		if (selected_tab != undefined ) {
			this.tab_array.splice(int_file_index, 1);
			this.tab_number_array.splice(int_file_index, 1);
			// 
			this.remove_tab_ops(int_file_index);
		}
		this.display_next_to_tab(int_file_index);
		this.display_tabs();
	}
	display_tabs(){
		// 
		var tab_section = document.getElementById("file-editor-title-inner");
		var tab_length  = this.tab_array.length;
		var tab_width   = 630 / tab_length;
		tab_width      -= 30;
		var tab_width_percent = tab_width < 300 ? tab_width : 300; // 計算量少なくする
		var focused_file = this.focus_file;
		this.remove_all_child();
		this.tab_array.forEach( function(item, index) {
			var tab_file_array = item.split("/");
			var tab_file_name  = tab_file_array[tab_file_array.length-1]
			var div_ele  = document.createElement("p");
			div_ele.classList.add("file_tab");
			var tab_svg_href     = "<img src='files/image/600px-File_font_awesome.svg.png' style='height:15px'>"
			var tab_display_href = "<a href='javascript:tabs.display_add_tab_content(\"" + index + "\")'>" + tab_file_name + "</a>"
			var tab_delete_href  = "<a href='javascript:tabs.remove_tab(\"" + index + "\")' style=\"float:right;\">×<a/>"
			div_ele.innerHTML    = tab_svg_href + tab_delete_href + "<br>" + tab_display_href;
			div_ele.style.width  = tab_width_percent + "px";
			if (index == focused_file) { div_ele.classList.add("focus-file") }
			tab_section.appendChild(div_ele);
		} );
	}
	remove_all_child(){
		var editor_title = document.getElementById("file-editor-title-inner");
		while (editor_title.firstChild) {
			editor_title.removeChild(editor_title.firstChild);
		}
	}
	remove_tab_ops(int_file_index){
		// 
		if (int_file_index <= this.focus_file) { 
			this.focus_file -= 1;
		} else if (this.tab_array.length == 1) {
			this.focus_file = this.tab_array[0];
		}

	}
	display_next_to_tab(file_index){
		// 
		if (this.tab_array.length == 0) {
			fileEditor.setValue("");
		} else if (file_index == 0){
			this.display_tab_content(0);
		} else {
			this.display_tab_content(file_index-1)
		}
	}
	display_add_tab_content(file_index){
		// update previous(current) tab content
		update_tab_editor_data(fileEditor, tabs); // 必要なら result_path 定義
		// --- code ---
		var int_file_index = file_index;
		document.getElementById("file-editor-title-inner").getElementsByTagName("p")[this.focus_file].classList.remove("focus-file");
		this.focus_file = int_file_index;
		document.getElementById("file-editor-title-inner").getElementsByTagName("p")[int_file_index].classList.add("focus-file");
		this.display_tab_content(file_index);
	}
	display_tab_content(file_index){
		//
		var int_file_index = parseInt(file_index);
		var tab_path = this.tab_array[int_file_index].split("/");
		var tab_file = tab_path[tab_path.length-1];
		var tab_parent_id = this.tab_number_array[int_file_index];
		var file_content_path = "/file?filename=" + tab_file + "&filenumber=" + tab_parent_id;
		$.getJSON(file_content_path, function(json){
			fileEditor.setValue(json["file_content"]);
		})
		.success(function(json){
			console.log(file_content_path);
		})
		.error(function(jpXHR, textStatus, errorThrown){
			// 主に new_file の場合 
			fileEditor.setValue("");
		})
	}
}

