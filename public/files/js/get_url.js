// 
function update_tab_editor_data(editor, tabs, result_=""){
	// @ Should confirm tab to be alway correct.
	// 
	var editor_content	= editor.getValue();
	var tab_position 	= tabs.focus_file;
	var file_path		= tabs.tab_array[tab_position];
	var editor_json		= {'file_path':file_path, 'file_content':editor_content};
	console.log(editor_json);
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
