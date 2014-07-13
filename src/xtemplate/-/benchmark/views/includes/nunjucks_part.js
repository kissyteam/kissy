(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["includes/nunjucks_part.html"] = (function() {function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
output += "<!DOCTYPE html>\r\n<html lang=\"en\">\r\n<head>\r\n    <title>";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "title"), env.autoesc);
output += "</title>\r\n    <script type=\"text/javascript\">\r\n    if (foo)\r\n        bar(1 + 5)\r\n\r\n    </script>\r\n</head>\r\n<body>\r\n    <h1>nunjucks - node template engine</h1>\r\n    <div id=\"container\" class=\"col\"></div>\r\n    ";
if(runtime.contextOrFrameLookup(context, frame, "using")) {
output += "\r\n        <p>You are amazing</p>\r\n    ";
;
}
else {
output += "\r\n        <p>Get on it!</p>\r\n    ";
;
}
output += "\r\n    <p>paragraph paragraph paragraph paragraph</p>\r\n    <ul>\r\n    ";
frame = frame.push();
var t_3 = runtime.contextOrFrameLookup(context, frame, "lis");
if(t_3) {for(var t_1=0; t_1 < t_3.length; t_1++) {
var t_4 = t_3[t_1];
frame.set("li", t_4);
frame.set("loop.index", t_1 + 1);
output += "\r\n        <li> ";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "loop")),"index", env.autoesc), env.autoesc);
output += " : ";
output += runtime.suppressValue(runtime.memberLookup((t_4),"d", env.autoesc), env.autoesc);
output += " of ";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "title"), env.autoesc);
output += "</li>\r\n    ";
;
}
}
frame = frame.pop();
output += "\r\n     </ul>\r\n</body>\r\n</html>";
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};
})();
})();

