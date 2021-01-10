// 
function initialize_editor(files_array, files_index) {
	c_index = draw_filelist(files_array, files_indexed);
	// file inner section
	var fileEditor = CodeMirror.fromTextArea(document.getElementById('file-editor'), {
	    mode: "javascript",
	    lineNumbers: true,
	    indentUnit: 4
	});
	fileEditor.setSize(null, 600);
	fileEditor.on("change", function(cm, change){
		// could implement func using variable [change]
		//    > need not to send tons of content getValue() gets
		// if (tabs.tab_array.length > 0 ) {
		// 	update_file_content_every_minute(cm, tabs, "");
		// }
		console.log(tabs.tab_array[tabs.focus_file]);
		tabs.detect_file_status();
		// impl function to toggle delete_button and update button
		// 
		// console.log(cm.getValue().slice(0, 100));
	});
	return fileEditor;
}