/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:18
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 date/popup-picker/render-xtpl
 date/popup-picker
*/

KISSY.add("date/popup-picker/render-xtpl", ["date/picker-xtpl"], function(S, require, exports, module) {
  return function(scope, S, undefined) {
    var buffer = "", config = this.config, engine = this, moduleWrap, utils = config.utils;
    if(typeof module !== "undefined" && module.kissy) {
      moduleWrap = module
    }
    var runBlockCommandUtil = utils.runBlockCommand, renderOutputUtil = utils.renderOutput, getPropertyUtil = utils.getProperty, runInlineCommandUtil = utils.runInlineCommand, getPropertyOrRunCommandUtil = utils.getPropertyOrRunCommand;
    buffer += '<div class="';
    var config1 = {};
    var params2 = [];
    params2.push("content");
    config1.params = params2;
    var id0 = runInlineCommandUtil(engine, scope, config1, "getBaseCssClasses", 1);
    buffer += renderOutputUtil(id0, true);
    buffer += '">\n    ';
    var config4 = {};
    var params5 = [];
    params5.push("date/picker-xtpl");
    config4.params = params5;
    if(moduleWrap) {
      require("date/picker-xtpl");
      config4.params[0] = moduleWrap.resolveByName(config4.params[0])
    }
    var id3 = runInlineCommandUtil(engine, scope, config4, "include", 2);
    buffer += renderOutputUtil(id3, false);
    buffer += "\n</div>";
    return buffer
  }
});
KISSY.add("date/popup-picker", ["./popup-picker/render-xtpl", "date/picker", "component/extension/shim", "component/extension/align"], function(S, require) {
  var PopupPickerTpl = require("./popup-picker/render-xtpl"), DatePicker = require("date/picker"), Shim = require("component/extension/shim"), AlignExtension = require("component/extension/align");
  var PopupDatePickerRender = DatePicker.getDefaultRender().extend({}, {ATTRS:{contentTpl:{value:PopupPickerTpl}}});
  return DatePicker.extend([Shim, AlignExtension], {}, {xclass:"popup-date-picker", ATTRS:{xrender:{value:PopupDatePickerRender}}})
});

