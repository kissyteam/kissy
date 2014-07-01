/** Compiled By kissy-xtemplate */
/*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
var itemTabRatingHtml = function (scope, buffer, undefined) {
    var tpl = this, nativeCommands = tpl.root.nativeCommands, utils = tpl.root.utils;
    var callFnUtil = utils['callFn'], callCommandUtil = utils['callCommand'], eachCommand = nativeCommands['each'], withCommand = nativeCommands['with'], ifCommand = nativeCommands['if'], setCommand = nativeCommands['set'], includeCommand = nativeCommands['include'], parseCommand = nativeCommands['parse'], extendCommand = nativeCommands['extend'], blockCommand = nativeCommands['block'], macroCommand = nativeCommands['macro'], debuggerCommand = nativeCommands['debugger'];
    buffer.write('<!--\u8BC4\u4EF7-->\r\n<div class="mod-reviews-content">\r\n</div>\r\n\r\n<textarea class="ks-lazyload hidden">\r\n    <script>\r\n        KISSY.use("detail/reviews/", function(S,Reviews) {\r\n            Reviews();\r\n        });\r\n    </script>\r\n</textarea>', 0);
    return buffer;
};
itemTabRatingHtml.TPL_NAME = module.name;
itemTabRatingHtml.version = '5.0.0';
module.exports = itemTabRatingHtml;