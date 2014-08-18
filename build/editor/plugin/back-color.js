/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:19
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/back-color
*/

KISSY.add("editor/plugin/back-color", ["./color/btn", "./back-color/cmd"], function(S, require) {
  var Button = require("./color/btn");
  var cmd = require("./back-color/cmd");
  function backColor(config) {
    this.config = config || {}
  }
  S.augment(backColor, {pluginRenderUI:function(editor) {
    cmd.init(editor);
    Button.init(editor, {defaultColor:"rgb(255, 217, 102)", cmdType:"backColor", tooltip:"\u80cc\u666f\u989c\u8272"})
  }});
  return backColor
});

