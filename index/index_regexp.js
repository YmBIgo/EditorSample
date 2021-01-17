// regexp parts
var variable_regexp 			= /\s{1}([\w\-]+)\s{1}/;
var word_regexp					= /[\w\-\s]+/;
var branket_regexp				= /\s*[\"\']\s*/; // should distinguish " and '
var array_start_branket_regexp	= /\s*\[\s*/;
var array_end_branket_regexp	= /\s*\]\s*/;
var array_content_regexp		= /[\s\w\-\[\]\{\}\"\']+/ // 本来は、"" や '' の中身も考慮すべき
var comma_regexp				= /,{0,1}/;
var string_regexp				= new Regexp ( branket_regexp + word_regexp + branket_regexp );
var variable_regexp				= new Regexp ( variable_regexp );
// should use for loop to imple, not regular expression
var array_regexp 				= new Regexp ( array_start_branket_regexp + "((" + word_regexp + comma_regexp
									+ ")|(" + array_start_branket_regexp + array_content_regexp + array_end_branket_regexp
									+ ")|(" 
									+ array_end_branket_regexp );
var variable_regexp				= /(var|const|let)\s+([\w\-]+)\s*\=\s*[\"\']([\w\-\s]*)[\"\']/;
var defined_function_regexp		= /function\s*([\w\-]+)\s*\(\s*([\w\-]+\s*(\=[\"\']{0,1}[\w\-\s]*[\"\']{0,1}){0,1},{0,1}\s*)*\)/; // [\"\']{0,1}
var used_function_regexp 		= /([\w\-]+(\({0,1}(\s*[\"\']{0,1}\s*[\w\-\s]+\s*[\"\']{0,1}\s*,{0,1}\s*)\){0,1})*)(\.[\w\-]+(\({0,1}(\s*[\"\']{0,1}\s*[\w\-\s]+\s*[\"\']{0,1}\s*,{0,1}\s*)\){0,1})*)*/;