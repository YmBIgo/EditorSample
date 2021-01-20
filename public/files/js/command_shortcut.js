function check_command_line(event){
	var current_keycode = event.keyCode;
	var current_tag_name = event.path[0].tagName;
	if ( current_tag_name != "TEXTAREA" && current_tag_name != "INPUT" ) {
		// 
		if ( event.shiftKey && current_keycode == 71 ) {
			display_search_modal();
		}
	}
}