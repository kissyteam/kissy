/** Compiled By kissy-xtemplate */
/*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
var itemTabDealRecordHtml = function (scope, buffer, undefined) {
    var tpl = this, nativeCommands = tpl.root.nativeCommands, utils = tpl.root.utils;
    var callFnUtil = utils['callFn'], callCommandUtil = utils['callCommand'], eachCommand = nativeCommands['each'], withCommand = nativeCommands['with'], ifCommand = nativeCommands['if'], setCommand = nativeCommands['set'], includeCommand = nativeCommands['include'], parseCommand = nativeCommands['parse'], extendCommand = nativeCommands['extend'], blockCommand = nativeCommands['block'], macroCommand = nativeCommands['macro'], debuggerCommand = nativeCommands['debugger'];
    buffer.write('<!--\u6210\u4EA4\u8BB0\u5F55-->\r\n<div class="mod-deal ks-scroll-view" id="mod-deal">\r\n\r\n</div>\r\n\r\n<textarea class="ks-lazyload hidden">\r\n    <script>\r\n        KISSY.use("detail/deal/", function(S,Mod) {\r\n            Mod({\r\n                container: "#mod-deal"\r\n            })\r\n        });\r\n    </script>\r\n</textarea>', 0);
    return buffer;
};
itemTabDealRecordHtml.TPL_NAME = module.name;
itemTabDealRecordHtml.version = '5.0.0';
module.exports = itemTabDealRecordHtml;