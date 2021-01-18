// 
function update_tab_editor_data(editor, tabs, file_index, result_="", is_temp_file=false, file_updated_content=""){
	// @ Should confirm tab to be alway correct.
	// 
	// fetch で update しているだけ。
	//   > return は関係ない
	// var tab_position 	= tabs.focus_file;
	var tab_position	= file_index;
	var file_path		= tabs.tab_array_main[tab_position];
	if ( tabs.tab_array.length == 0 ) { console.log("Tab not found."); return; }
	var editor_content	= ( file_updated_content == "" ) ? editor.getValue() : file_updated_content;
	// var tab_changes 	= tabs.tab_writing_count_array[file_path];
	var current_tab_url = (is_temp_file == true) ? 'http://localhost:3000/create_tempfile' : 'http://localhost:3000/create_file';
	console.log(file_path, current_tab_url);
	var editor_json		= {'file_path':file_path, 'file_content':editor_content};
	// environ variable とかも dotenv で使える？が。
	fetch(current_tab_url, {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
		},
		body: JSON.stringify(editor_json),
	}).then(response => {
		result_content = response.json();
		return result_content;
	}).then(data => {
		console.log("update [" + data["file_name"] + "] file...");
		_result = data["file_name"];
	}).catch(error => {
		console.log(error);
		result_content = error;
	});
}

function update_file_index(file_path){
	// 
	var file_index_path = "create_index_json";
	var index_result_response;
	return fetch(file_index_path, {
		method: "POST",
		headers: {
			'content-type' : 'application/json',
		},
		body: JSON.stringify({file_path:file_path, is_output:1})
	}).then(response => {
		var index_response_json = response.json();
		return index_response_json
	})
}

// function for blank tab

// function to temporary updating file content using ajax
function update_file_content_every_minute(editor, tabs, result_=""){
	console.log(tabs.tab_array_main[tabs.focus_file]);
	update_tab_editor_data(editor, tabs, result_);
}

// function to create temp file
//   > impl without file_path, file_content
function create_temp_file(tabs){
	if ( tabs.tab_array.length == 0 ) { console.log("Tab not found."); return; }
	var file_path      = tabs.tab_array_main[tabs.focus_file];
	var editor_content = fileEditor.getValue();
	var editor_json    = { 'file_path': file_path, 'file_content': editor_content };
	fetch('http://localhost:3000/create_temp_file', {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
		},
		body: JSON.stringify(editor_json)
	}).then(respons => {
		result_content = response.json();
		return result_content;
	}).then(data => {
		console.log("update [" + data["file_name"] + "] file...");
		_result = data["file_name"];
	}).catch(error => {
		console.log(error);
		result_content = error;
	})
}