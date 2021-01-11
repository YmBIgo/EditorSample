// 
// 1. position relative 関係 @ file_editor_section
// 2. add_tab の main 分岐
// 3. add blank tab   tempfile の扱い
// 
class Tabs {
	constructor(tab_array, tab_number_array=[]){
		this.tab_array = tab_array;
		this.tab_array_main  = []; 
		this.tab_array_right = []; 
		this.tab_array_left  = []; 
		// 
		this.tab_number_array = tab_number_array; // 本来は constructor の 引数
		this.focus_file = 0;
		this.tab_pos_array = [];
		this.tab_mid_pos_array = [];
		this.moving_tab_pos = 0;
		this.changed_tabs_while_moved = [];
		this.tab_prev_moving_pos = 0;
		this.tab_interval_pos_array = [];
		// 
		this.tab_writing_button_array = [];
		this.tab_writing_count_array  = {};
		this.tab_writing_updated_array = {}; // flag [tempfile] to 0 / [original] to 1 => use tempfile if 1 
		this.tab_is_writing = -1;
		this.tab_is_writing_array = [];
		// 
		this.tab_content_stack = "";
	}
	add_tab(file_id, parent_id){
		//
		var tab_file_name = get_fullpath(files_array, file_id);
		var selected_tab  = this.tab_array.indexOf(tab_file_name);
		var selected_tab_main = this.tab_array_main.indexOf(tab_file_name);
		tabs.tab_is_writing = selected_tab;
		if (selected_tab == -1) {
			// this.tab_array.push(tab_file_name);
			var new_file_pos = this.add_tab_with_side_tab(tab_file_name);
			var selected_tab = new_file_pos;
			this.check_side_tab(new_file_pos);
			this.tab_number_array.push(parent_id);
			this.tab_writing_button_array.push(tab_file_name);
		} else {
			if ( selected_tab_main != -1 ) {
				selected_tab = this.tab_array_main.indexOf(tab_file_name);
			} else {
				// tab_array_main にあるかで、分岐
				var selected_tab_is_left  = this.tab_array_left.indexOf(tab_file_name);
				if ( selected_tab_is_left != -1 ) {
					this.focus_file = 0;
					this.tab_array_left  = this.tab_array.slice(0, selected_tab);
					this.tab_array_main  = this.tab_array.slice(selected_tab, selected_tab+5);
					this.tab_array_right = this.tab_array.slice(selected_tab+5);
				} else {
					var selected_tab_is_right = this.tab_array_right.indexOf(tab_file_name);
					this.tab_array_right = this.tab_array.slice(selected_tab+1);
					this.tab_array_main  = this.tab_array.slice(selected_tab-4, selected_tab+1);
					this.tab_array_left  = this.tab_array.slice(0, selected_tab-4);
				}
			}
		}
		this.focus_file = this.tab_array_main.indexOf(tab_file_name);
		this.focus_file = (this.focus_file > 4) ? 4 : this.focus_file; 
		this.display_tabs();
		this.tab_is_writing = this.focus_file;
		// create temp file for new file.
		update_tab_editor_data(fileEditor, this, this.focus_file, "", false);
		update_tab_editor_data(fileEditor, this, this.focus_file, "", true);
		// --- code ---
		this.tab_is_writing_array.push(tab_file_name);
	}
	add_blank_tag(){
		// 
		// Right | Left | Main
		// tab_number_array
		// tab_writing_[count/updated]_array | tab_is_writing
		// update previous(current) tab content
		// --- code ---
		var blank_tab_name  = this.create_new_blank_name();
		this.tab_is_writing = -1;
		this.tab_writing_count_array[blank_tab_name]   = 0;
		this.tab_writing_updated_array[blank_tab_name] = 1;
		fileEditor.setValue("");
		var new_tab_pos = this.add_tab_with_side_tab(blank_tab_name);
		this.check_side_tab(new_tab_pos);
		this.tab_number_array.push(-1);
		this.tab_writing_button_array.push(blank_tab_name);
		this.focus_file = this.tab_array_main.indexOf(blank_tab_name);
		this.focus_file = (this.focus_file > 4) ? 4 : this.focus_file;
		this.display_tabs();
		update_tab_editor_data(fileEditor, this, this.focus_file, "", true);
		// temp 保存
		this.tab_is_writing_array.push(blank_tab_name);
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
		// Right | Left
		// --- code ---
		var int_file_index = parseInt(file_index);
		var selected_tab   = this.tab_array_main[int_file_index];
		console.log("removing ", selected_tab, "...");
		if (selected_tab != undefined ) {
			// update previous(current) tab content
			// this.set_file_content(selected_tab, int_file_index, 0, false);
			// update_tab_editor_data(fileEditor, this, int_file_index, "", true, this.tab_content_stack); // 必要なら result_path 定義
			delete this.tab_writing_count_array[selected_tab];
			var tab_writing_pos = this.tab_is_writing_array.indexOf(selected_tab);
			if (tab_writing_pos != -1) { this.tab_is_writing_array.splice(tab_writing_pos, 1) }
			delete this.tab_writing_updated_array[selected_tab];
			// 
			var tab_array_index = this.tab_array.indexOf(this.tab_array_main[int_file_index]);
			this.tab_array.splice(tab_array_index, 1);
			this.tab_array_main.splice(int_file_index, 1);
			// main 向けコード？
			var tab_number_pos = int_file_index + this.tab_array_left.length;
			this.tab_number_array.splice(tab_number_pos, 1);
			var tab_left_length = this.tab_array_left.length;
			if ( tab_left_length > 0 ) {
				var last_left_tab   = this.tab_array_left[tab_left_length - 1];
				this.tab_array_main.unshift(last_left_tab);
				this.tab_array_left.splice(tab_left_length-1, 1);
			} else if ( this.tab_array_right.length > 0 ) {
				// 
				var first_right_tab  = this.tab_array_right[0];
				this.tab_array_main.push(first_right_tab);
				this.tab_array_right.splice(0, 1);
			}
			this.remove_tab_ops(int_file_index);
			// writing 関係
			var writing_tab_index = this.tab_writing_button_array.indexOf(selected_tab);
			if ( writing_tab_index != -1 ) { this.tab_writing_button_array.splice(writing_tab_index, 1) }
			// this.tab_is_writing = (this.tab_array_main.length > 0) ? this.focus_file : -1;
		}
		this.tab_is_writing = -1;
		// show tab data ....
		// this.show_tab_data_by_count(tab_file_name, this.focus_file);
		console.log("adding new file ", int_file_index);
		this.display_next_to_tab(int_file_index);
		this.display_tabs();
		update_tab_editor_data(fileEditor, this, this.focus_file, "", true);
	}
	show_tab_data_by_count(tab_file_name, tab_file_index){
		// show tab data ....
		if ( this.tab_writing_count_array[tab_file_name] == 0 ) {
			console.log("Displaying temp file ", tab_file_name, " ...");
			this.set_file_content(tab_file_index, tab_file_name, 0, true);
		} else if ( this.tab_writing_count_array[tab_file_name] != 0 ) {
			this.set_file_content(tab_file_index, tab_file_name, 1, true);
			console.log("Displaying original file ", tab_file_name, "...");
		}
	}
	check_side_tab(selected_pos){
		// 
		// tab_array_main の最後に来るのを、selected_pos に
		var tab_length = this.tab_array.length;
		if ( tab_length < 6 ) { return; }
		this.tab_array_main  = this.tab_array.slice(selected_pos - 4, selected_pos + 1);
		this.tab_array_right = this.tab_array.slice(selected_pos + 1);
		this.tab_array_left  = this.tab_array.slice(0, selected_pos - 4);
	}
	add_tab_with_side_tab(tab_file_name){
		// 
		var selected_pos 	 = 0;
		// var tab_right_length = this.tab_array_right.length;
		var tab_left_length	 = this.tab_array_left.length;
		var tab_main_length  = this.tab_array_main.length;
		if ( tab_main_length == 5 ) {
			this.tab_array_left.unshift(this.tab_array_main[4]);
			this.tab_array_main = this.tab_array_main.slice(0, 4);
			this.tab_array_main.push(tab_file_name);
		} else {
			this.tab_array_main.push(tab_file_name);
		}
		selected_pos = tab_left_length + tab_main_length;
		this.tab_array.splice(selected_pos, 0, tab_file_name);
		// console.log(selected_pos);
		return selected_pos
	}

	// display tags
	display_tabs(){
		// 
		// Right | Left
		var tab_section = document.getElementById("file-editor-title-inner");
		// 
		// tab right, tabe left があるかで、 
		// tab width, tab_pos_left に30px程度のバッファ持たせる  
		// 	> length 確認 -> tag_array[main, right, left] 作成
		//  > tag_array[right], tag_array[left] に 重ね合わせ表示
		//  > tag_array[right], tag_array[left] に mouseclick 付与
		//
		var tab_width; var tab_width_percent;
		[tab_width, tab_width_percent] = this.adjust_tag_width();
		var focused_file = this.focus_file;
		this.remove_tab_name_dialog();
		this.remove_all_child();
		this.tab_pos_array = [];
		// this.tab_array.forEach( function(item, index) {
		this.tab_array_main.forEach( function(item, index) {
			var tab_file_array = item.split("/");
			var tab_file_name  = tab_file_array[tab_file_array.length-1];
			var file_tab_ele  = document.createElement("p");
			file_tab_ele.classList.add("file_tab");
			// set position
			var tab_post_left_original = 314 + (tabs.tab_array_left.length) * 10;
			var tab_pos_left = tab_post_left_original + 32*index + tab_width_percent*index; // inappropriate to use MAGIC NUMBER 314 and 32
			// console.log(tab_post_left_original, tab_pos_left);
			file_tab_ele.style.position = "absolute";
			file_tab_ele.style.top  = "78.5px";
			file_tab_ele.style.left = tab_pos_left + "px"
			file_tab_ele.style.zIndex = 57;
			tabs.tab_pos_array.push([78.5, tab_pos_left])
			// 
			var tab_svg_href     = "<img src='files/image/600px-File_font_awesome.svg.png' style='height:15px'>"
			var tab_display_href = "<a class='tab_file_name' href='javascript:tabs.display_add_tab_content(" + index + ")'>" + tab_file_name + "</a>"
			file_tab_ele.innerHTML    = tab_svg_href + "<br>" + tab_display_href; // tab_delete_href も追加していた
			file_tab_ele.style.width  = tab_width_percent + "px";
			file_tab_ele.setAttribute("index_num", index);
			file_tab_ele.setAttribute("dragging_tab", 0);
			file_tab_ele.setAttribute("file_full_path", item);
			// 
			var href_pos = tab_pos_left + tab_width_percent + 10;
			tabs.display_delete_button(index, href_pos, tab_section, item);
			// var tab_delete_href  = "<a class='tab_delete_button' index_num='" + index + "' style=\"float:right;top:60px;left:" + href_pos + "px\">×<a/>"
			// tab dialog
			tabs.on_mouseover_op(file_tab_ele, index, tab_width_percent);
			tabs.on_mouseleave_op(file_tab_ele);
			// tab draggable
			tabs.on_mousedown_op(file_tab_ele, index);
			tabs.on_mouseup_op(file_tab_ele, index, tab_width_percent);
			if (index == focused_file) { file_tab_ele.classList.add("focus-file") }
			tab_section.appendChild(file_tab_ele);
		} );
		this.display_side_tab_content(tab_section, tab_width_percent);
	}
	adjust_tag_width(){
		var tab_length  = this.tab_array_main.length;
		var total_width = 630 - (this.tab_array_left.length + this.tab_array_right.length) * 10 
		var tab_width   = total_width / tab_length;
		tab_width      -= 30;
		var tab_width_percent = tab_width < 300 ? tab_width : 300; // 計算量少なくする
		var tab_width_percent = tab_width_percent < 90 ?  90 : tab_width_percent;
		return [tab_width, tab_width_percent];
	}
	display_side_tab_content(tab_section, tab_width){
		// 
		this.tab_array_left.forEach(function(item, index){
			// var tab_file_array = item.split("/");
			// var tab_file_name  = tab_file_array[tab_file_array.length-1];
			tabs.display_side_tab_content_inner(index, 0, 314, tab_width, tab_section);
		});
		this.tab_array_right.forEach(function(item, index){
			// 
			var tab_right_location = 860 + tabs.tab_array_left.length * 10;
			tabs.display_side_tab_content_inner(index, 1, tab_right_location, tab_width, tab_section);
			// document.getElementsByClassName("side_file_tab")[index].style.zIndex = zIndex_num;
		});
	}

	display_side_tab_content_inner(index, is_right, tab_location, tab_width, tab_section){
		// 
		// left => tab_location 314, right => tab_location 950
		var file_tab_ele = document.createElement("p");
		file_tab_ele.classList.add("side_file_tab");
		var file_tab_ele_left   = tab_location + index * 12;
		file_tab_ele.style.left = file_tab_ele_left + "px";
		file_tab_ele.style.width = tab_width + "px";
		var zIndex_counter   	= index + 1;
		var zIndex_num			= ( is_right == 1 ) ? 20 - zIndex_counter : 10 + zIndex_counter;
		file_tab_ele.style.zIndex = zIndex_num;
		file_tab_ele.style.position = "absolute";
		file_tab_ele.setAttribute("index_num", index);
		tab_section.appendChild(file_tab_ele);
		this.on_side_mouseclick_op(file_tab_ele, index, is_right);
		this.on_mouseover_op(file_tab_ele, index, tab_width, is_right+1);
		this.on_mouseleave_op(file_tab_ele);
		// this.on_mouseover_op(element, index, tab_width_percent, array_pos=1);
	}

	remove_all_child(){
		var editor_title = document.getElementById("file-editor-title-inner");
		while (editor_title.firstChild) {
			editor_title.removeChild(editor_title.firstChild);
		}
	}
	remove_all_delete_button(){
		var delete_buttons = document.getElementsByClassName("tab_delete_button");
		var delete_buttons_length = delete_buttons.length;
		for(var i = delete_buttons_length - 1; i > -1; i--){
			delete_buttons[i].remove(); // jquery ってのが...
		}
	}
	remove_tab_ops(int_file_index){
		// 
		if (this.focus_file == 0) {
			this.focus_file = 0;
		} else if (int_file_index <= this.focus_file) { 
			this.focus_file -= 1;
		} else if (this.tab_array.length == 1) {
			this.focus_file = this.tab_array[0];
		}

	}
	display_next_to_tab(file_index){
		// 
		if (this.tab_array_main.length == 0) {
			fileEditor.setValue("");
		} else if (file_index == 0){
			this.display_tab_content(0);
		} else {
			this.display_tab_content(file_index-1)
		}
	}
	display_add_tab_content(file_index){
		this.tab_is_writing = -1;
		var int_file_index = parseInt(file_index); 
		// update previous(current) tab content
		update_tab_editor_data(fileEditor, this, this.focus_file, "", true); // 必要なら result_path 定義
		var file_name = this.tab_array_main[int_file_index];
		this.tab_writing_count_array[file_name]   = 0;
		this.tab_writing_updated_array[file_name] = 1;
		// --- code ---
		document.getElementById("file-editor-title-inner").getElementsByTagName("p")[this.focus_file].classList.remove("focus-file");
		this.focus_file = int_file_index;
		document.getElementById("file-editor-title-inner").getElementsByTagName("p")[int_file_index].classList.add("focus-file");
		console.log(file_name);
		this.show_tab_data_by_count(file_name, int_file_index);
		// this.display_tab_content(file_index);
		this.tab_is_writing = tabs.focus_file;
	}
	display_tab_content(file_index){
		//
		var int_file_index = parseInt(file_index);
		var file_path = this.tab_array_main[int_file_index];
		var file_content   = this.show_tab_data_by_count(file_path, int_file_index);
	}

	display_delete_button(index, href_pos, tab_section, file_path){
		// 
		var tab_delete_button	 = document.createElement("a");
		tab_delete_button.classList.add("tab_delete_button");
		tab_delete_button.setAttribute("index_num", index);
		tab_delete_button.style.left = href_pos + "px";
		tab_delete_button.style.top  = "88px";
		tab_delete_button.style.zIndex = 100;
		tab_delete_button.style.position = "absolute";
		tab_section.appendChild(tab_delete_button);
		// delete button or update button
		// var tab_updated = this.tab_writing_updated_array[file_path];
		var tab_writing_pos = this.tab_is_writing_array.indexOf(file_path);
		var tab_writing_changes = this.tab_writing_count_array[file_path];
		if (tab_writing_changes > 0) {
		// if ( this.tab_is_writing != -1 && this.tab_is_writing == index ) {
			tab_delete_button.innerText  = "〇";
			tabs.on_mouseclick_update_button(tab_delete_button);
		} else {
			tab_delete_button.innerText  = "×";
			tabs.on_mouseclick_delete_button(tab_delete_button);
		}
	}

	// save temp/original file content

	set_file_content(file_index, file_path, is_temp=0, set_editor=true, only_variable=false){
		// 
		console.log("saving ", file_path, " with is_temp ", is_temp, "...");
		var is_file_temp  = this.tab_writing_count_array[file_path];
		var file_content  = "";
		if ( is_file_temp == 0 || is_temp == 0 ) {
			var tab_path = file_path.split("/");
			var tab_file = tab_path[tab_path.length-1];
			var tab_left_len  = this.tab_array_left.length;
			// tab_parnet_id = -1 の場合、考える
			var tab_parent_id = this.tab_number_array[tab_left_len + file_index];
			var file_content_path = "/file?filename=" + tab_file + "&filenumber=" + tab_parent_id;
		} else {
			var file_content_path = "/tempfile?filename=" + file_path;
		}
		console.log(file_content_path);
		if ( only_variable == true ) { return file_content_path }
		// temp file 用の 取得方法も考える
		$.getJSON(file_content_path, function(json){
			file_content = json["file_content"];
			tabs.tab_content_stack = file_content;
			if (set_editor == true) {
				fileEditor.setValue(file_content);
			}
		})
		.success(function(json){
			return file_content
		})
		.error(function(jpXHR, textStatus, errorThrown){
			// 主に new_file の場合 
			console.log("error");
			fileEditor.setValue("");
		});
	}

	// mouse move
	on_mouseover_op(element, index, tab_width_percent, array_pos=0){
		element.addEventListener("mouseover", () => {
			tabs.gen_tab_name_dialog(index, tab_width_percent, array_pos);
		}, false);
	}
	on_mouseleave_op(element){
		element.addEventListener("mouseleave", () => {
			tabs.remove_tab_name_dialog();
		}, false);
	}
	on_mousedown_op(element, index){
		element.onmousedown = function(event){
			// tabs の変数...
			console.log("mouse start to move ", tabs.tab_array_main[index], " ...");
			// tabs.set_file_content(index, tabs.tab_array[index], 1, false);
			// update_tab_editor_data(fileEditor, tabs, index, "", true, tabs.tab_content_stack);
			tabs.tab_is_writing = -1;
			tabs.gen_tab_interval_pos_array();
			tabs.gen_tab_mid_pos_array();
			tabs.moving_tab_pos = index;
			tabs.changed_tabs_while_moved.push(tabs.moving_tab_pos);
			document.getElementsByClassName("focus-file")[0].classList.remove("focus-file");
			var file_tab_element = document.getElementsByClassName("file_tab")[index];
			file_tab_element.setAttribute("dragging_tab", 1);
			file_tab_element.style.zIndex = 58;
			file_tab_element.classList.add("focus-file");
			tabs.tab_prev_moving_pos = tabs.tab_mid_pos_array[index];
			element.addEventListener("mousemove", (event) => {
				tabs.add_draggable_tab(event);
				// impl func to detect change and update other tabs
			});
		};
	}
	on_mouseup_op(element, index, tab_width_percent){
		element.onmouseup = function(event){
			// tabs の変数...
			console.log("mouse stop move.");
			tabs.changed_tabs_while_moved = uniq(tabs.changed_tabs_while_moved);
			element.removeEventListener("mousemove", (event) => {
				tabs.add_draggable_tab(event);
			});
			var moved_index = tabs.moving_tab_pos;
			var file_tab_elements = document.getElementsByClassName("file_tab");
			var old_file_tab_element = file_tab_elements[index];
			old_file_tab_element.classList.remove("focus-file");
			var file_tab_element  = file_tab_elements[moved_index];
			tabs.focus_file = moved_index;
			old_file_tab_element.style.zIndex = 57;
			old_file_tab_element.setAttribute("dragging_tab", 0);
			var x = event.clientX;
			// var width = file_tab_element.offsetWidth; var left_pos = x-width/2;
			// 
			for (var i = 0; i < tabs.changed_tabs_while_moved.length; i++ ) {
				var i_index = tabs.changed_tabs_while_moved[i];
				var i_file_tab = file_tab_elements[i_index];
				var result_tab_element = i_file_tab.cloneNode(true);
				i_file_tab.parentNode.replaceChild(result_tab_element, i_file_tab);
				tabs.on_mouseover_op(result_tab_element, i_index, tab_width_percent);
				tabs.on_mouseleave_op(result_tab_element);
				tabs.on_mousedown_op(result_tab_element, i_index);
				tabs.on_mouseup_op(result_tab_element, i_index, tab_width_percent);
				if (i_index == moved_index) { result_tab_element.classList.add("focus-file"); }
			}
			tabs.set_draggable_tab(); // Right | Left も追加
			tabs.moving_tab_pos = 1;
			tabs.changed_tabs_while_moved = [];
			// tabs.display_tabs(); // 変更しているのが、mouseover と mousedown の中の index だけなので、改善余地あり
							   		// index の file_tab の node削除と再作成？
			var file_tab_file_name = document.getElementsByClassName("file_tab")[moved_index].getAttribute("file_full_path");
			// tab_is_writing_array は、変更の必要なし
			// tabs.display_tab_content(moved_index);
			console.log("tab is writing at ", tabs.tab_is_writing, " ...");
			tabs.show_tab_data_by_count(file_tab_file_name, moved_index);
			tabs.remove_all_delete_button();
			var tab_section = document.getElementById("file-editor-title-inner");
			tabs.tab_array_main.forEach(function(item, index){
				// 
				var href_pos = tabs.tab_pos_array[index][1] + tab_width_percent + 10;
				tabs.display_delete_button(index, href_pos, tab_section, item);
			});
		};
	}

	on_side_mouseclick_op(element, index, side){
		// 
		// Should add " Save Content " function.
		element.addEventListener("click", () => {
			// 0 for left, 1 for right
			this.tab_is_writing = -1;
			var whole_array_pos  = this.tab_array_left.length + this.focus_file;
			var current_tab_name = this.tab_array_main[this.focus_file];
			if ( this.tab_writing_count_array[current_tab_name] > 0 ){
				update_tab_editor_data(fileEditor, this, this.focus_file, "", true);
			}
			console.log("whole array length ", whole_array_pos, " / current array pos ", current_tab_name);
			if (side == 0) { 
				 // var left_main_array = this.tab_array_left.slice(index, index + 5);
				 var main_pos =  5 - (this.tab_array_left.length - index);
				console.log("left ", main_pos);
				 // var main_main_array = this.tab_array_main.slice(0, main_pos);
				 var main_array = this.tab_array.slice(index, index + 5);
				 // var main_array 		= [...left_main_array, ...main_main_array];
				var left_array 		= this.tab_array.slice(0, index); // tab_array_left ?
				 // var main_right_array = this.tab_array_main.slice(main_pos);
				 var main_right_array_from_origin = this.tab_array.slice(index + 5);
				 var right_array 	= main_right_array_from_origin;
				// var right_array 	= [...main_right_array, ...this.tab_array_right];
				this.tab_array_main = main_array; this.tab_array_left = left_array; this.tab_array_right = right_array;
				console.log(left_array, main_array, right_array);
				// focus file の変更
			} else if (side == 1) {
				 var main_pos = 5 - index - 1;
				 console.log("right ", main_pos);
				 if ( main_pos > 1 ) {
				 	 var right_main_array = this.tab_array_right.slice(0, index + 1);
				 	 var main_main_array  = this.tab_array_main.slice(-main_pos);
				 	var main_array  = [...main_main_array, ...right_main_array];
				 	var right_array = this.tab_array_right.slice(index + 1);
				 	 var main_left_array  = this.tab_array_main.slice(0, -main_pos);
				 	var left_array  = [...this.tab_array_left, ...main_left_array];
				 	console.log(left_array, main_array, right_array);
				 	this.tab_array_main = main_array; this.tab_array_left = left_array; this.tab_array_right = right_array;
				 } else {
				 	var main_array = this.tab_array_right.slice(index-4, index + 1);
				 	 var right_left_array = this.tab_array_right.slice(0, index);
				 	var left_array = [...this.tab_array_left, ...this.tab_array_main, ...right_left_array];
				 	var right_array = [];
				 	if ( this.tab_array_right[index + 1] != undefined ) {
				 		// 
				 		var right_array 	= this.tab_array_right.slice(index + 1);
				 		this.tab_array_main = main_array; this.tab_array_left = left_array; this.tab_array_right = right_array;
				 	} else {
				 		this.tab_array_main = main_array; this.tab_array_left = left_array; this.tab_array_right = [];
				 	}
				 	console.log(left_array, main_array, right_array);
				 }
				 // focus file の変更
			}
			var array_pos_after_changed = this.tab_array_main.indexOf(current_tab_name);
			this.tab_is_writing = -1;
			if ( array_pos_after_changed != -1 ) {
				this.focus_file = array_pos_after_changed;
			} else {
				this.focus_file = 0;
				this.display_tab_content(0);
			}
			update_tab_editor_data(fileEditor, this, this.focus_file, "", true);
			this.display_tabs();
		});
	}

	on_mouseclick_delete_button(element){
		element.addEventListener('click', () => {
			var delete_index_num = parseInt(element.getAttribute("index_num"));
			var delete_file_name = document.getElementsByClassName("file_tab")[delete_index_num].getAttribute("file_full_path");
			// var tab_writing_pos = tabs.tab_is_writing_array.indexOf(delete_file_name);
			// if (tab_writing_pos != -1) { tabs.tab_is_writing_array.splice(tab_writing_pos, 1) }
			tabs.remove_tab(delete_index_num);
		});	
	}

	on_mouseclick_update_button(element){
		// Should add " Save Content " function.
		element.addEventListener('click', () => {
			var update_index_num = parseInt(element.getAttribute("index_num"));
			var update_file_name = document.getElementsByClassName("file_tab")[update_index_num].getAttribute("file_full_path");
			var update_number_num = this.tab_number_array[update_index_num];
			if ( update_number_num != -1 ) {
				if ( update_index_num != tabs.focus_file ) {
					console.log("update index and focus file is different.");
					// 
					var file_content_path = tabs.set_file_content(update_index_num, update_file_name, 1, false, true);
					$.getJSON(file_content_path, function(json){
						tabs.tab_content_stack = json["file_content"];
					})
					.error(function(jpXHR, textStatus, errorThrown){
						// 主に new_file の場合 
						console.log("error");
						fileEditor.setValue("");
					})
					.then(function(){
						update_tab_editor_data(fileEditor, tabs, update_index_num, "", false, tabs.tab_content_stack);
					});
				} else {
					console.log("update index and focus file is same")
					tabs.tab_content_stack = fileEditor.getValue();
					update_tab_editor_data(fileEditor, tabs, update_index_num, "", false, tabs.tab_content_stack);
				}
			} else if (update_number_num == -1) {
				console.log("Tab parent id is ", update_number_num);
				// modal 表示 で return
				// File 読み込み 後、追加
				var file_content = ""; var script_content = "";
				$.getJSON("/get_modal", function(json){
					file_content = json["html_content"];
					script_content = json["js_content"];
				}).then(function(){
					var modal_div = document.getElementsByClassName("modal_div_section")[0]
					if (modal_div != undefined) { modal_div.remove(); }
					var div_wrapper = document.createElement("div");
					div_wrapper.classList.add("modal_div_section");
					var modal_div_wrapper = document.getElementsByTagName("body")[0].appendChild(div_wrapper);
					modal_div_wrapper.innerHTML = file_content;
					// or return ...
					$('#modalArea').fadeIn();
					$(function (){
						$('#modalBg').click(function(event){ // #closeModal, 
							// コードが びみょい
							var modal_target_class = event.target.classList;
							if ( modal_target_class[0] == "modalBg" ) {
								$('#modalArea').fadeOut();
							}
						});
					});
				}).then(function(){
					eval(script_content);
				});
				return;
			}
			tabs.tab_is_writing = -1;
			tabs.tab_writing_updated_array[update_file_name] = 1;
			tabs.tab_writing_count_array[update_file_name]   = 0;
			var tab_writing_pos = tabs.tab_is_writing_array.indexOf(update_file_name);
			if (tab_writing_pos != -1) { tabs.tab_is_writing_array.splice(tab_writing_pos, 1) }
			// element の event 削除 & delete 追加
			var new_element = element.cloneNode(true);
			element.parentNode.replaceChild(new_element, element);
			tabs.on_mouseclick_delete_button(new_element)
			new_element.innerText = "×";
			tabs.tab_is_writing = tabs.focus_file;
		})
	}

	// Draggable tab
	add_draggable_tab(event){
		// 
		// 位置が一定より超えたら、強制終了
		var file_tabs = document.getElementsByClassName("file_tab");
		var file_delete_buttons = document.getElementsByClassName("tab_delete_button");
		var index = this.get_dragging_tab(file_tabs);
		if (index === false) { return false }
		var file_tab  = file_tabs[index];
		var file_delete_button  = file_delete_buttons[index];
		var x = event.clientX;
		if ( x < 370 ) { return };
		if ( x > 880 ) { return };
		var y = event.clientY;
		var width     = file_tab.offsetWidth;
		var left_pos  = x - width/2;
		var right_pos = x + width/2;
		// var height = tab_dialog.offsetHeight;
		// tab_dialog.style.top  = (y-height/2) + "px";
		file_tab.style.left = (left_pos) + "px";
		file_delete_button.style.left = (right_pos - 10) + "px";
		this.check_moving_tab(index, left_pos, right_pos, x);
	}

	set_draggable_tab(){
		// 
		var draggable_array = this.tab_pos_array;
		var file_tabs = document.getElementsByClassName("file_tab");
		var delete_buttons = document.getElementsByClassName("tab_delete_button");
		var tab_path_names  = this.tab_array_main;
		for(var i = 0; i < file_tabs.length; i++){
			// position relative に 変更した場合 
			file_tabs[i].style.left = draggable_array[i][1] + "px";
			file_tabs[i].style.top  = draggable_array[i][0] + "px";
			var file_path_name 		= tab_path_names[i].split("/");
			file_path_name 			= file_path_name[file_path_name.length-1];
			file_tabs[i].getElementsByClassName("tab_file_name")[0].innerText  = file_path_name;
			file_tabs[i].setAttribute("file_full_path", tab_path_names[i]);
			file_tabs[i].setAttribute("index_num", i);
			// delete button
			delete_buttons[i].innerText = "×";
			this.on_mouseclick_delete_button(delete_buttons[i]);
		}
	}

	get_dragging_tab(file_tabs){
		// 
		for(var i = 0; i < file_tabs.length; i++) {
			if (file_tabs[i].getAttribute("dragging_tab") == "1") {
				return i
				// var file_tab_i = this.tab_array.indexOf( file_tabs[i].getElementsByTagName("a")[2].innerText );
				// return file_tab_i;
			}
		}
		return false;
	}

	check_dragging_tab(left_pos, index){
		// 
		var current_pos = index;
		for(var i = 0; i < tabs.tab_pos_array.length; i++){
			if (i != index && tabs.tab_interval_pos_array[i][0] < left_pos && tabs.tab_interval_pos_array[i][1] > left_pos) {
				current_pos = i;
			}
		}
		if (current_pos != index) {
			this.exchange_tab(current_pos, index);
			// console.log(this.tab_array);
		}
		return current_pos;
	}

	gen_tab_interval_pos_array(){
		// 
		var tab_pos_array = tabs.tab_pos_array;
		var tab_interval_pos_array = [];
		var tab_interval = (tab_pos_array.length > 1) ? tab_pos_array[1][1] - tab_pos_array[0][1] : 300;
		for(var i = 0; i < this.tab_pos_array.length; i++){
			// 
			var next_tab_pos = (tab_pos_array[i+1] != undefined) ? tab_pos_array[i+1][1] : tab_pos_array[i][1] + tab_interval;
			tab_interval_pos_array.push([tab_pos_array[i][1], next_tab_pos]);
		}
		this.tab_interval_pos_array = tab_interval_pos_array;
	}

	gen_tab_mid_pos_array(){
		// こんな難しいコードじゃなくていい...
		// add_draggable_tab 毎で、発火するようにする
		var tab_pos_interval = (this.tab_pos_array[1][1] - this.tab_pos_array[0][1]) / 2;
		var tab_mid_pos_array = [];
		var tab_original_pos = this.tab_pos_array[0][1]
		// this.tab_pos_array.map(item => [item[1], item[1] + tab_pos_interval]);
		for(var i = 0; i < this.tab_pos_array.length; i++){
			var tab_interval_num = i*2 + 1;
			// 0 の場合...
			tab_mid_pos_array.push(tab_original_pos + tab_pos_interval * tab_interval_num);
			var is_red_exist = document.getElementById("file-editor-title").getElementsByClassName("position-red");
			if (is_red_exist == undefined) {
				var hoge_ele = document.createElement("p");
				hoge_ele.classList.add("position-red");
				hoge_ele.style.position = "absolute";
				hoge_ele.style.left = (tab_original_pos + tab_pos_interval * tab_interval_num) + "px";
				hoge_ele.style.top  = "30px"
				hoge_ele.style.backgroundColor = "red";
				hoge_ele.innerText  = (tab_original_pos + tab_pos_interval * tab_interval_num);
				document.getElementById("file-editor-title").appendChild(hoge_ele);
			}
		}
		this.tab_mid_pos_array = tab_mid_pos_array;
	}

	check_moving_tab(index, left_pos, right_pos, mid_pos){
		// 
		// Right | Left
		var current_pos = this.tab_prev_moving_pos - mid_pos;
		var file_tabs   = document.getElementsByClassName("file_tab");
		// console.log(current_pos);
		for(var i = 0; i < this.tab_mid_pos_array.length; i++){
			// if ( i == index ) { continue }
			if ( current_pos > 0 ) {
				if ( left_pos > this.tab_mid_pos_array[i] - 10 && left_pos < this.tab_mid_pos_array[i] + 10 && this.moving_tab_pos != i ) {
					this.moving_tab_pos = i; this.tab_prev_moving_pos = mid_pos ;
					console.log("left", i, this.tab_array_main[i], this.tab_mid_pos_array[i]);
					this.exchange_tab(i, i+1);
					this.changed_tabs_while_moved.push(i);
					this.changed_tabs_while_moved = uniq(this.changed_tabs_while_moved);
					var current_file_tab = this.search_file_tab_by_name(this.tab_array_main[i+1]);
					var prev_file_tab    = this.search_file_tab_by_name(this.tab_array_main[i]);
					// file_tabs[i].style.left = this.tab_pos_array[i+1][1] + "px";
					var tab_moved_pos = this.tab_pos_array[i+1][1] + "px";
					// current_file_tab.animate({ "left": tab_moved_pos }, 500, function(){
					// 			var current_file_tab1 = this.search_file_tab_by_name(this.tab_array[i-1]);
					// 			console.log(current_file_tab1.innerText);
					// 			current_file_tab1.style.left = tab_moved_pos;
					// 		});
					current_file_tab.style.left = tab_moved_pos;
					return i;
				}
			} else if (current_pos < 0) {
				if ( right_pos > this.tab_mid_pos_array[i] - 10 && right_pos < this.tab_mid_pos_array[i] + 10 && this.moving_tab_pos != i ) {
					this.moving_tab_pos = i; this.tab_prev_moving_pos = mid_pos;
					console.log("right", i, this.tab_array_main[i], this.tab_mid_pos_array[i]);
					this.exchange_tab(i, i-1);
					this.changed_tabs_while_moved.push(i);
					this.changed_tabs_while_moved = uniq(this.changed_tabs_while_moved);
					var current_file_tab = this.search_file_tab_by_name(this.tab_array_main[i-1]);
					var prev_file_tab    = this.search_file_tab_by_name(this.tab_array_main[i]);
					var tab_moved_pos = this.tab_pos_array[i-1][1] + "px";
					// current_file_tab.animate({ "left": tab_moved_pos }, 500, function(){
					// 			var current_file_tab1 = this.search_file_tab_by_name(this.tab_array[i-1]);
					// 			console.log(current_file_tab1.innerText);
					// 			current_file_tab1.style.left = tab_moved_pos;
					// 		});
					current_file_tab.style.left = tab_moved_pos;
					return i;
				}
			}
		}
		return -1
	}

	exchange_tab(prev_pos, current_pos){
		// 
		// Right | Left
		var tab_left_len 	 = this.tab_array_left.length;
		var current_whole_pos = current_pos + tab_left_len;
		var prev_whole_pos	 = prev_pos + tab_left_len; 
		var current_pos_path = this.tab_array_main[current_pos]; var prev_pos_path = this.tab_array_main[prev_pos];
		var current_file_id  = this.tab_number_array[current_whole_pos];
		var prev_file_id     = this.tab_number_array[prev_whole_pos];
		var current_html	 = this.search_file_tab_by_index(current_pos);
		var prev_html		 = this.search_file_tab_by_index(prev_pos);
		var prev_tab_pos 	 = prev_html.getAttribute("index_num");
		var current_tab_pos  = current_html.getAttribute("index_num");
		console.log(prev_tab_pos, current_tab_pos);
		this.tab_array_main[current_pos] = prev_pos_path; this.tab_array_main[prev_pos] = current_pos_path;
		this.tab_number_array[current_whole_pos] = prev_file_id; this.tab_number_array[prev_whole_pos] = current_file_id;
		current_html.setAttribute("index_num", prev_tab_pos);
		// current_html.setAttribute("file_full_path", prev_pos_path);
		prev_html.setAttribute("index_num", current_tab_pos);
		// prev_html.setAttribute("file_full_path", current_pos_path);
		this.tab_array = [...this.tab_array_left, ...this.tab_array_main, ...this.tab_array_right];
	}

	// Dialog to display file path.
	gen_tab_name_dialog(index, tab_length, array_pos){
		// 
		// Right | Left  >  array_pos [ main => 0, left => 1, right => 2 ]
		var tab_dialog = document.getElementsByClassName("file_name_dialog");
		if (tab_dialog.length > 0){ return }
		var new_node = document.createElement("div");
		new_node.classList.add("file_name_dialog");
		var tab_margin_length = 0; // - の方がいい？
		if (array_pos == 0) { tab_margin_length = (tab_length+32) * index + 10 * (this.tab_array_left.length) + 10;
		} else if (array_pos == 1) { tab_margin_length = 0 + (10*index)
		} else if (array_pos == 2) { tab_margin_length = 530 + (10*index) }
		new_node.style.marginLeft = tab_margin_length + "px";
		if (array_pos == 0) { new_node.innerText = this.tab_array_main[index];
		} else if (array_pos == 1) { new_node.innerText = this.tab_array_left[index];
		} else if (array_pos == 2) { new_node.innerText = this.tab_array_right[index]; }
		var tab_node = document.getElementsByClassName("focus-file")[0];
		var tabs_header = document.getElementById("file-editor-title-inner");
		tabs_header.insertBefore(new_node, tab_node);
	}

	remove_tab_name_dialog(){
		console.log("removing diaglog...");
		var tab_dialog = document.getElementsByClassName("file_name_dialog");
		for(var i = tab_dialog.length - 1; i > -1; i--){
			tab_dialog[i].remove();
		}
	}

	// Basic Function
	search_file_tab_by_index(index){
		var file_tabs = document.getElementsByClassName("file_tab");
		// var file_tab  = Array.prototype.slice.call(file_tabs).filter(item => item.getAttribute("index_num") == index);
		for (var i = 0; i < file_tabs.length; i++) {
			var index_num = parseInt(file_tabs[i].getAttribute("index_num"));
			if (index_num == index) { return file_tabs[i] } /* id か 迷う */
		}
		return []
	}
	search_file_tab_by_name(f_name){
		var file_tabs = document.getElementsByClassName("file_tab");
		console.log("<> search file " + f_name + " ...");
		for (var i = 0; i < file_tabs.length; i++) {
			var file_name = file_tabs[i].getAttribute("file_full_path");
			if (file_name == f_name) { return file_tabs[i] }
		}
		return []
	}

	// tab writing...
	detect_file_status(){
		// should quit if file opened not updated
		if ( this.tab_array_main.length == 0 ) { return false }
		var current_file_name = this.tab_array_main[this.focus_file];
		// var is_file_writing   = this.tab_writing_button_array.indexOf(current_file_name);
		if (this.tab_is_writing != -1) {
			console.log("853 ", this.tab_is_writing);
			// if ( this.tab_is_writing == 1 ) { this.tab_is_writing = 0; return false; }
			this.tab_writing_count_array[current_file_name] += 1;
			this.tab_writing_updated_array[current_file_name] = 0;
			// 何かしらの間隔で、 generate_temp_file 発火させる
			// this.tab_writing_updated_array[current_file_name] = 0;
			if (this.tab_writing_count_array[current_file_name] < 1 ) { return false }
			var current_button    = document.getElementsByClassName("tab_delete_button")[this.focus_file];
			var new_current_button = current_button.cloneNode(true);
			current_button.parentNode.replaceChild(new_current_button, current_button);
			new_current_button.innerText = "〇";
			tabs.on_mouseclick_update_button(new_current_button);
			update_tab_editor_data(fileEditor, this, this.focus_file, "", true);
		} else {
			// 
			tabs.tab_is_writing = tabs.focus_file;
		}
	}
	save_writing_content(){
		// 
	}
	generate_temp_file(focus_file_id){
		this.focus_file = focus_file_id;
		create_temp_file(this);
	}

}

// Default Function
function uniq(array){
	const uniqedArray = [];
	for (const elem of array ) {
		if (uniqedArray.indexOf(elem) < 0) {
			uniqedArray.push(elem);
		}
	}
	return uniqedArray;
}