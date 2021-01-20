function display_search_modal(){
	var html_file_content; var js_script_content;
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
					document.getElementsByClassName("modal_search_section")[0].remove();
				}
			});
		});
	})
	.then(function(){
		console.log(js_script_content)
		eval(js_script_content);
	});
}
