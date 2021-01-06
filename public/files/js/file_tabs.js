// 
// 1. position relative 関係 @ file_editor_section
// 2. × ボタンが使えない
// 
// 
class Tabs {
	constructor(tab_array, tab_number_array=[]){
		this.tab_array = tab_array;
		this.tab_array_main  = []; // 可能なら...
		this.tab_array_right = []; // 可能なら...
		this.tab_array_left  = []; // 可能なら...
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
	}
	add_tab(file_id, parent_id){
		// Right | Left
		var tab_file_name = get_fullpath(files_array, file_id);
		var selected_tab = this.tab_array.indexOf(tab_file_name);
		if (selected_tab == -1) {
			// this.tab_array.push(tab_file_name);
			var new_file_pos = this.add_tab_with_side_tab(tab_file_name);
			this.check_side_tab(new_file_pos);
			this.tab_number_array.push(parent_id);
		} else {
			selected_tab = this.tab_array_main.indexOf(tab_file_name);
			// tab_array_main にあるかで、分岐
		}
		this.focus_file = this.tab_array_main.indexOf(tab_file_name);
		this.focus_file = (this.focus_file > 4) ? 4 : this.focus_file; 
		this.display_tabs();
		// update previous(current) tab content
		update_tab_editor_data(fileEditor, tabs); // 必要なら result_path 定義
		// --- code ---
	}
	add_blank_tag(){
		// 
		// Right | Left
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
		// Right | Left
		// update previous(current) tab content
		update_tab_editor_data(fileEditor, tabs); // // 必要なら result_path 定義
		// --- code ---
		var int_file_index = file_index;
		var selected_tab   = this.tab_array[int_file_index];
		if (selected_tab != undefined ) {
			this.tab_array.splice(int_file_index, 1);
			// main 向けコード？
			this.tab_number_array.splice(int_file_index, 1);
			this.remove_tab_ops(int_file_index);
		}
		this.display_next_to_tab(int_file_index);
		this.display_tabs();
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
		console.log(selected_pos);
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
		var tab_dialogs = document.getElementsByClassName("file_name_dialog");
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
			console.log(tab_post_left_original, tab_pos_left);
			file_tab_ele.style.position = "absolute";
			file_tab_ele.style.top  = "78.5px";
			file_tab_ele.style.left = tab_pos_left + "px"
			file_tab_ele.style.zIndex = 57;
			tabs.tab_pos_array.push([78.5, tab_pos_left])
			// 
			var tab_svg_href     = "<img src='files/image/600px-File_font_awesome.svg.png' style='height:15px'>"
			var tab_display_href = "<a class='tab_file_name' href='javascript:tabs.display_add_tab_content(" + index + ")'>" + tab_file_name + "</a>"
			var tab_delete_href  = "<a href='javascript:tabs.remove_tab(" + index + ")' style=\"float:right;\">×<a/>"
			file_tab_ele.innerHTML    = tab_svg_href + tab_delete_href + "<br>" + tab_display_href;
			file_tab_ele.style.width  = tab_width_percent + "px";
			file_tab_ele.setAttribute("index_num", index);
			file_tab_ele.setAttribute("dragging_tab", 0);
			file_tab_ele.setAttribute("file_full_path", item);
			// tab dialog
			tabs.on_mouseover_op(file_tab_ele, tab_dialogs, index, tab_width_percent);
			tabs.on_mouseleave_op(file_tab_ele);
			// tab draggable
			tabs.on_mousedown_op(file_tab_ele, index);
			tabs.on_mouseup_op(file_tab_ele, index, tab_dialogs, tab_width_percent);
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
		this.tab_array_right.reverse().forEach(function(item, index){
			// 
			var tab_right_location = 850 + tabs.tab_array_left.length * 10;
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
		if (this.tab_array_main.length == 0) {
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
		var tab_path = this.tab_array_main[int_file_index].split("/");
		var tab_file = tab_path[tab_path.length-1];
		var tab_left_len = this.tab_array_left.length;
		var tab_parent_id = this.tab_number_array[tab_left_len + int_file_index];
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

	// mouse move
	on_mouseover_op(element, tab_dialogs, index, tab_width_percent){
		element.addEventListener("mouseover", () => {
			tabs.gen_tab_name_dialog(tab_dialogs, index, tab_width_percent);
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
			console.log("mouse start to move.");
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
	on_mouseup_op(element, index, file_tabs, tab_width_percent){
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
			tabs.set_draggable_tab();
			for (var i = 0; i < tabs.changed_tabs_while_moved.length; i++ ) {
				var i_index = tabs.changed_tabs_while_moved[i];
				var i_file_tab = file_tab_elements[i_index];
				var result_tab_element = i_file_tab.cloneNode(true);
				i_file_tab.parentNode.replaceChild(result_tab_element, i_file_tab);
				tabs.on_mouseover_op(result_tab_element, file_tabs, i_index, tab_width_percent);
				tabs.on_mouseleave_op(result_tab_element);
				tabs.on_mousedown_op(result_tab_element, i_index);
				tabs.on_mouseup_op(result_tab_element, i_index, file_tabs, tab_width_percent);
				if (i_index == moved_index) { result_tab_element.classList.add("focus-file"); }
			}
			tabs.set_draggable_tab(); // Right | Left も追加
			tabs.moving_tab_pos = 1;
			tabs.changed_tabs_while_moved = [];
			// tabs.display_tabs(); // 変更しているのが、mouseover と mousedown の中の index だけなので、改善余地あり
								 // index の file_tab の node削除と再作成？
			tabs.display_tab_content(moved_index);
		};
	}

	on_side_mouseclick_op(element, index, side){
		// 
		element.addEventListener("click", () => {
			// 0 for left, 1 for right
			if (side == 0) { 
				 var left_main_array = this.tab_array_left.slice(index, index + 5);
				 var main_pos =  5 - (this.tab_array_left.length - index);
				 var main_main_array = this.tab_array_main.slice(0, main_pos);
				var main_array 		= [...left_main_array, ...main_main_array];
				var left_array 		= this.tab_array_left.slice(0, index);
				 var main_right_array = this.tab_array_main.slice(main_pos);
				var right_array 	= [...main_right_array, ...this.tab_array_right];
				this.tab_array_main = main_array; this.tab_array_left = left_array; this.tab_array_right = right_array;
				console.log(left_array, main_array, right_array);
			} else if (side == 1) {
				 var main_pos = 5 - index - 1;
				 console.log(main_pos);
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
			}
			tabs.display_tabs();
		});
	}

	// Draggable tab
	add_draggable_tab(event){
		// 
		// 位置が一定より超えたら、強制終了
		var file_tabs = document.getElementsByClassName("file_tab");
		var index = this.get_dragging_tab(file_tabs);
		if (index === false) { return false }
		var file_tab  = file_tabs[index];
		var x = event.clientX;
		var y = event.clientY;
		var width     = file_tab.offsetWidth;
		var left_pos  = x - width/2;
		var right_pos = x + width/2;
		// var height = tab_dialog.offsetHeight;
		// tab_dialog.style.top  = (y-height/2) + "px";
		file_tab.style.left = (left_pos) + "px";
		this.check_moving_tab(index, left_pos, right_pos, x);
	}

	set_draggable_tab(){
		// 
		var draggable_array = this.tab_pos_array;
		var file_tabs = document.getElementsByClassName("file_tab");
		var tab_path_names  = this.tab_array_main;
		for(var i = 0; i < file_tabs.length; i++){
			// position relative に 変更した場合 
			file_tabs[i].style.left = draggable_array[i][1] + "px";
			file_tabs[i].style.top  = draggable_array[i][0] + "px";
			var file_path_name 		= tab_path_names[i].split("/");
			file_path_name 			= file_path_name[file_path_name.length-1];
			file_tabs[i].getElementsByClassName("tab_file_name")[0].innerText  = file_path_name;
			file_tabs[i].setAttribute("index_num", i);
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
			var hoge_ele = document.createElement("p");
			hoge_ele.style.position = "absolute";
			hoge_ele.style.left = (tab_original_pos + tab_pos_interval * tab_interval_num) + "px";
			hoge_ele.style.top  = "30px"
			hoge_ele.style.backgroundColor = "red";
			hoge_ele.innerText  = (tab_original_pos + tab_pos_interval * tab_interval_num);
			document.getElementById("file-editor-title").appendChild(hoge_ele);
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
				if ( left_pos > this.tab_mid_pos_array[i] - 5 && left_pos < this.tab_mid_pos_array[i] + 5 && this.moving_tab_pos != i ) {
					this.moving_tab_pos = i; this.tab_prev_moving_pos = mid_pos ;
					console.log("left", i, this.tab_array_main[i], this.tab_mid_pos_array[i]);
					this.exchange_tab(i, i+1);
					this.changed_tabs_while_moved.push(i);
					this.changed_tabs_while_moved = uniq(this.changed_tabs_while_moved);
					var current_file_tab = this.search_file_tab_by_name(this.tab_array_main[i+1]);
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
				if ( right_pos > this.tab_mid_pos_array[i] - 5 && right_pos < this.tab_mid_pos_array[i] + 5 && this.moving_tab_pos != i ) {
					this.moving_tab_pos = i; this.tab_prev_moving_pos = mid_pos;
					console.log("right", i, this.tab_array_main[i], this.tab_mid_pos_array[i]);
					this.exchange_tab(i, i-1);
					this.changed_tabs_while_moved.push(i);
					this.changed_tabs_while_moved = uniq(this.changed_tabs_while_moved);
					var current_file_tab = this.search_file_tab_by_name(this.tab_array_main[i-1]);
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
		this.tab_array_main[current_pos] = prev_pos_path; this.tab_array_main[prev_pos] = current_pos_path;
		this.tab_number_array[current_whole_pos] = prev_file_id; this.tab_number_array[prev_whole_pos] = current_file_id;
		current_html.setAttribute("index_num", prev_pos);
		// current_html.setAttribute("file_full_path", prev_pos_path);
		prev_html.setAttribute("index_num", current_pos);
		// prev_html.setAttribute("file_full_path", current_pos_path);
		this.tab_array = [...this.tab_array_left, ...this.tab_array_main, ...this.tab_array_right];
	}

	// Dialog to display file path.
	gen_tab_name_dialog(tab_dialog, index, tab_length){
		// 
		// Right | Left
		if (tab_dialog.length > 0){ return }
		var new_node = document.createElement("div");
		new_node.classList.add("file_name_dialog");
		var tab_margin_length = (tab_length+32) * index + 10;
		new_node.style.marginLeft = tab_margin_length + "px";
		new_node.innerText = this.tab_array_main[index];
		var tab_node = document.getElementsByClassName("focus-file")[0];
		var tabs_header = document.getElementById("file-editor-title-inner");
		tabs_header.insertBefore(new_node, tab_node);
	}

	remove_tab_name_dialog(){
		console.log("removing diaglog...");
		var tab_dialog = document.getElementsByClassName("file_name_dialog");
		for(var i = 0; i < tab_dialog.length; i++){
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