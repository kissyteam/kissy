/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:22
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/fore-color
*/

KISSY.add("editor/plugin/fore-color", ["./color/btn", "./fore-color/cmd"], function(S, require) {
  var Button = require("./color/btn");
  var cmd = require("./fore-color/cmd");
  function ForeColorPlugin(config) {
    this.config = config || {}
  }
  S.augment(ForeColorPlugin, {pluginRenderUI:function(editor) {
    cmd.init(editor);
    Button.init(editor, {cmdType:"foreColor", defaultColor:"rgb(204, 0, 0)", tooltip:"\u6587\u672c\u989c\u8272"})
  }});
  return ForeColorPlugin
});

