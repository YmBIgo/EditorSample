// 
// Todo
//   > modal movable に
function display_search_modal(){
	var html_file_content; var js_script_content;
	var modal_search_area = $("#modalSearchArea");
	if ( modal_search_area[0] != undefined ) {
		var current_search_modal_status = modal_search_area[0].style.display;
		if ( current_search_modal_status == "none" ) {
			 modal_search_area.fadeIn();
		}
		return;
	}
	$.getJSON("/get_search_modal", function(json){
		html_file_content = json["html_content"];
		js_script_content = json["js_script"];
	})
	.then(function(){
		var is_search_modal_exist   = document.getElementsByClassName("modal_search_section")[0]
		if ( is_search_modal_exist != undefined ) { is_search_modal_exist.remove(); }
		var search_modal_wrapper    = document.createElement("div");
		search_modal_wrapper.classList.add("modal_search_section");
		var search_modal_div_wrapper = document.getElementsByTagName("body")[0].appendChild(search_modal_wrapper);
		search_modal_wrapper.innerHTML = html_file_content;
		$("#modalSearchArea").fadeIn();
		$(function (){
			$('#modalBg').click(function(event){ /* closeModal */
				var modal_target_class = event.target.classList;
				if ( modal_target_class[0] == "modalBg" ) {
					$('#modalSearchArea').fadeOut();
					// document.getElementsByClassName("modal_search_section")[0].remove();
				}
			});
		});
	})
	.then(function(){
		eval(js_script_content);
	});
}

function generate_search_code_snippet(code_content, search_keyword, page_title, page_url) {
	// init
	var old_search_code_snippet = document.getElementsByClassName("code-snippet-modal");
	if ( old_search_code_snippet.length > 0 ) {
		for ( var i = 0; i > old_search_code_snippet.length; i++ ) {
			old_search_code_snippet[i].remove();
		}
	}
	// config
	var code_content_keys = Object.keys(code_content);
	// modal
	var search_code_snippet 	  = document.createElement("div");
	search_code_snippet.classList.add("code-snippet-modal");
	document.body.append(search_code_snippet);
	// title
	var search_code_snippet_title = document.createElement("a");
	search_code_snippet_title.innerText = page_title.slice(0, 30);
	search_code_snippet_title.href		= page_url;
	search_code_snippet_title.classList.add("code-snippet-title");
	var search_code_snippet_small_title = document.createElement("small");
	search_code_snippet_small_title.innerText = "\n[ " + search_keyword + " ] の検索結果";
	search_code_snippet_title.append(search_code_snippet_small_title);
	search_code_snippet.append(search_code_snippet_title);
	// textarea
	var code_snippet_textarea 	  = document.createElement("textarea");
	code_snippet_textarea.setAttribute("id", "editor_code_snippet_textarea");
	code_snippet_textarea.value   = code_content[code_content_keys[0]]["file_content"];
	search_code_snippet.append(code_snippet_textarea);
	// editor
	var codeSnippetEditor = CodeMirror.fromTextArea(code_snippet_textarea, {
		mode: "javascript",
		lineNumbers: true,
		indentUnit: 4
	});
	codeSnippetEditor.setSize(225, 240);
	code_snippet_textarea.style.width = "1px";
	code_snippet_textarea.style.height = "1px";
	code_snippet_textarea.style.display = "block";
	// footer
	var code_snippet_footer	 = document.createElement("span");
	code_snippet_footer.classList.add("code-snippet-footer");
	var current_status 	= document.createElement("span");
	current_status.innerText = " 1 / " + code_content_keys.length + " "
	var next_button 	= document.createElement("a");
	next_button.innerText 	 = " > ";
	next_button.onclick = function(e) {
		change_search_code_snippet_content(code_content, codeSnippetEditor, 1, current_status, search_code_snippet);
	}
	var prev_button 	= document.createElement("a");
	prev_button.innerText 	 = " < "
	prev_button.onclick = function(e) {
		change_search_code_snippet_content(code_content, codeSnippetEditor, 0, current_status, search_code_snippet);
	}
	var back_to_search  = document.createElement("span");
	back_to_search.innerText = "[検索に戻る]";
	back_to_search.style.margin = "0 3px"
	back_to_search.onclick = function(e) {
		display_search_modal();
	}
	var copy_snippet_text	 = document.createElement("span");
	copy_snippet_text.innerText = "[コピーする]"
	copy_snippet_text.style.margin = "0 3px";
	copy_snippet_text.onclick = function(e) {
		// 
		code_snippet_textarea.select();
		document.execCommand("copy");
	}
	var delete_snippet_text  = document.createElement("span");
	delete_snippet_text.innerText = "[閉じる]"
	delete_snippet_text.style.margin = "0 3px";
	delete_snippet_text.onclick = function(e) {
		search_code_snippet.remove();
	}
	code_snippet_footer.append(prev_button);
	code_snippet_footer.append(current_status);
	code_snippet_footer.append(next_button);
	code_snippet_footer.append(back_to_search);
	code_snippet_footer.append(copy_snippet_text);
	code_snippet_footer.append(delete_snippet_text);
	search_code_snippet.append(code_snippet_footer);
	// 
	codeSnippetEditor.setValue(code_content[code_content_keys[0]]["file_content"]);
	search_code_snippet.getElementsByClassName("CodeMirror")[0].top = "-8px";
}

function change_search_code_snippet_content(code_content, editor, up_or_down, status_ele, code_snippet_ele) {
	// 
	var current_status = parseInt(status_ele.innerText.replace(/\s/gi, "").split("/")[0]);
	var code_content_keys = Object.keys(code_content).sort();
	if ( current_status == code_content_keys.length || current_status == -1 ) { return }
	if ( up_or_down == 0 ) { current_status -= 1 } else if ( up_or_down == 1 ) { current_status += 1 }
	var code_content_key  = code_content_keys[current_status];
	console.log("change snippet to ", code_content_key, " @ ", current_status, " ...");
	if ( code_content_key == undefined ) { return }
	var code_content_content = code_content[code_content_key]["file_content"];
	status_ele.innerText = " " + current_status + " / " + code_content_keys.length + " ";
	editor.setValue(code_content_content);
	code_snippet_ele.getElementsByClassName("CodeMirror")[0].value = code_content_content;
}