/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 13 17:56
*/
/*
 Combined modules by KISSY Module Compiler: 

 editor/plugin/remove-format
*/

KISSY.add("editor/plugin/remove-format", ["editor", "./button", "./remove-format/cmd"], function(S, require) {
  var Editor = require("editor");
  require("./button");
  var formatCmd = require("./remove-format/cmd");
  function removeFormat() {
  }
  S.augment(removeFormat, {pluginRenderUI:function(editor) {
    formatCmd.init(editor);
    editor.addButton("removeFormat", {tooltip:"\u6e05\u9664\u683c\u5f0f", listeners:{click:function() {
      editor.execCommand("removeFormat")
    }}, mode:Editor.Mode.WYSIWYG_MODE})
  }});
  return removeFormat
});

