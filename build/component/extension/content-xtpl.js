/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 13 17:48
*/
/*
 Combined modules by KISSY Module Compiler: 

 component/extension/content-xtpl
*/

KISSY.add("component/extension/content-xtpl", [], function(S, require, exports, module) {
  var t = function(scope, S, payload, undefined) {
    var buffer = "", engine = this, moduleWrap, escapeHtml = S.escapeHtml, nativeCommands = engine.nativeCommands, utils = engine.utils;
    if(typeof module !== "undefined" && module.kissy) {
      moduleWrap = module
    }
    var callCommandUtil = utils.callCommand, debuggerCommand = nativeCommands["debugger"], eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro;
    buffer += '<div id="ks-content-';
    var id0 = scope.resolve(["id"]);
    buffer += escapeHtml(id0);
    buffer += '"\r\n           class="';
    var option2 = {};
    var params3 = [];
    params3.push("content");
    option2.params = params3;
    var id1 = callCommandUtil(engine, scope, option2, "getBaseCssClasses", 2);
    buffer += escapeHtml(id1);
    buffer += '">';
    var id4 = scope.resolve(["content"]);
    if(id4 || id4 === 0) {
      buffer += id4
    }
    buffer += "</div>";
    return buffer
  };
  t.TPL_NAME = module.name;
  return t
});

