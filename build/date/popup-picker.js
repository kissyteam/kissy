/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 13 17:49
*/
/*
 Combined modules by KISSY Module Compiler: 

 date/popup-picker/render-xtpl
 date/popup-picker
*/

KISSY.add("date/popup-picker/render-xtpl", ["date/picker-xtpl"], function(S, require, exports, module) {
  var t = function(scope, S, payload, undefined) {
    var buffer = "", engine = this, moduleWrap, escapeHtml = S.escapeHtml, nativeCommands = engine.nativeCommands, utils = engine.utils;
    if(typeof module !== "undefined" && module.kissy) {
      moduleWrap = module
    }
    var callCommandUtil = utils.callCommand, debuggerCommand = nativeCommands["debugger"], eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro;
    buffer += '<div class="';
    var option1 = {};
    var params2 = [];
    params2.push("content");
    option1.params = params2;
    var id0 = callCommandUtil(engine, scope, option1, "getBaseCssClasses", 1);
    buffer += escapeHtml(id0);
    buffer += '">\n    ';
    var option4 = {};
    var params5 = [];
    params5.push("date/picker-xtpl");
    option4.params = params5;
    if(moduleWrap) {
      require("date/picker-xtpl");
      option4.params[0] = moduleWrap.resolveByName(option4.params[0])
    }
    var id3 = includeCommand.call(engine, scope, option4, payload);
    if(id3 || id3 === 0) {
      buffer += id3
    }
    buffer += "\n</div>";
    return buffer
  };
  t.TPL_NAME = module.name;
  return t
});
KISSY.add("date/popup-picker", ["./popup-picker/render-xtpl", "date/picker", "component/extension/shim", "component/extension/align"], function(S, require) {
  var PopupPickerTpl = require("./popup-picker/render-xtpl"), DatePicker = require("date/picker"), Shim = require("component/extension/shim"), AlignExtension = require("component/extension/align");
  var PopupDatePickerRender = DatePicker.getDefaultRender().extend({}, {ATTRS:{contentTpl:{value:PopupPickerTpl}}});
  return DatePicker.extend([Shim, AlignExtension], {}, {xclass:"popup-date-picker", ATTRS:{xrender:{value:PopupDatePickerRender}}})
});

