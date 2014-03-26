/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 25 16:51
*/
/*
 Combined modules by KISSY Module Compiler: 

 date/popup-picker/render-xtpl
 date/popup-picker
*/

KISSY.add("date/popup-picker/render-xtpl", ["date/picker-xtpl"], function(S, require, exports, module) {
  var t = function(scope, S, buffer, payload, undefined) {
    var engine = this, moduleWrap, nativeCommands = engine.nativeCommands, utils = engine.utils;
    if("1.50" !== S.version) {
      throw new Error("current xtemplate file(" + engine.name + ")(v1.50) need to be recompiled using current kissy(v" + S.version + ")!");
    }
    if(typeof module !== "undefined" && module.kissy) {
      moduleWrap = module
    }
    var callCommandUtil = utils.callCommand, eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro, debuggerCommand = nativeCommands["debugger"];
    buffer.write('<div class="');
    var option0 = {escape:1};
    var params1 = [];
    params1.push("content");
    option0.params = params1;
    var commandRet2 = callCommandUtil(engine, scope, option0, buffer, "getBaseCssClasses", 1);
    if(commandRet2 && commandRet2.isBuffer) {
      buffer = commandRet2;
      commandRet2 = undefined
    }
    buffer.write(commandRet2, true);
    buffer.write('">\n    ');
    var option3 = {};
    var params4 = [];
    params4.push("date/picker-xtpl");
    option3.params = params4;
    if(moduleWrap) {
      require("date/picker-xtpl");
      option3.params[0] = moduleWrap.resolve(option3.params[0])
    }
    var commandRet5 = includeCommand.call(engine, scope, option3, buffer, 2, payload);
    if(commandRet5 && commandRet5.isBuffer) {
      buffer = commandRet5;
      commandRet5 = undefined
    }
    buffer.write(commandRet5, false);
    buffer.write("\n</div>");
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

