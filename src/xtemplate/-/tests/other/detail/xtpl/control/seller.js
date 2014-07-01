/** Compiled By kissy-xtemplate */
/*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
var sellerHtml = function (scope, buffer, undefined) {
    var tpl = this, nativeCommands = tpl.root.nativeCommands, utils = tpl.root.utils;
    var callFnUtil = utils['callFn'], callCommandUtil = utils['callCommand'], eachCommand = nativeCommands['each'], withCommand = nativeCommands['with'], ifCommand = nativeCommands['if'], setCommand = nativeCommands['set'], includeCommand = nativeCommands['include'], parseCommand = nativeCommands['parse'], extendCommand = nativeCommands['extend'], blockCommand = nativeCommands['block'], macroCommand = nativeCommands['macro'], debuggerCommand = nativeCommands['debugger'];
    buffer.write('\r\n<script>\r\n    KISSY.use("detail/mod", function(S,Mod) {\r\n        Mod.data("sellerConfig",$!securityUtil.ignoretext($moduletUtil.json($frontModule.getResult().getData(),true)));\r\n    });\r\n</script>', 0);
    return buffer;
};
sellerHtml.TPL_NAME = module.name;
sellerHtml.version = '5.0.0';
module.exports = sellerHtml;