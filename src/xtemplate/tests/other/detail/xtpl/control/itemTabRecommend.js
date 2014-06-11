/** Compiled By kissy-xtemplate */
/*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
var itemTabRecommendHtml = function (scope, buffer, undefined) {
    var tpl = this, nativeCommands = tpl.root.nativeCommands, utils = tpl.root.utils;
    var callFnUtil = utils['callFn'], callCommandUtil = utils['callCommand'], eachCommand = nativeCommands['each'], withCommand = nativeCommands['with'], ifCommand = nativeCommands['if'], setCommand = nativeCommands['set'], includeCommand = nativeCommands['include'], parseCommand = nativeCommands['parse'], extendCommand = nativeCommands['extend'], blockCommand = nativeCommands['block'], macroCommand = nativeCommands['macro'], debuggerCommand = nativeCommands['debugger'];
    buffer.write('<!--\u5B9D\u8D1D\u63A8\u8350-->\r\n\r\n<div class="mod-recommand">\r\n</div>\r\n\r\n<textarea class="ks-lazyload hidden">\r\n    <script>\r\n        KISSY.use("detail/recommand/", function(S,Mod) {\r\n            Mod({\r\n                container: \'.mod-recommand\'\r\n            });\r\n        });\r\n    </script>\r\n</textarea>', 0);
    return buffer;
};
itemTabRecommendHtml.TPL_NAME = module.name;
itemTabRecommendHtml.version = '5.0.0';
module.exports = itemTabRecommendHtml;