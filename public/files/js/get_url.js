// 
function update_tab_editor_data(editor, tabs, result_=""){
	// @ Should confirm tab to be alway correct.
	// 
	var tab_position 	= tabs.focus_file;
	var file_path		= tabs.tab_array[tab_position];
	if ( tabs.tab_array.length == 0 ) { console.log("Tab not found."); return; }
	var editor_content	= editor.getValue();
	var editor_json		= {'file_path':file_path, 'file_content':editor_content};
	// environ variable とかも dotenv で使える？が。
	fetch('http://localhost:3000/create_file', {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
		},
		body: JSON.stringify(editor_json),
	}).then(response => {
		result_url = response.json();
		return result_url;
	}).then(data => {
		console.log("update [" + data["file_name"] + "] file...");
		_result = data["file_name"];
	}).catch(error => {
		console.log(error);
		result_url = error;
	});
}

// function for blank tab

// function to temporary updating file content using ajax
function update_file_content_every_minute(editor, tabs, result_=""){
	console.log(tabs.tab_array[tabs.focus_file]);
	update_tab_editor_data(editor, tabs, result_);
}

// 