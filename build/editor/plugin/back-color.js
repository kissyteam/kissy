/*
Copyright 2013, KISSY v1.50dev
MIT Licensed
build time: Dec 2 15:14
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

