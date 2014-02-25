/*
Copyright 2014, KISSY v1.42
MIT Licensed
build time: Jan 6 12:45
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/code
*/

KISSY.add("editor/plugin/code", ["editor", "./button", "./dialog-loader"], function(S, require) {
  var Editor = require("editor");
  require("./button");
  var DialogLoader = require("./dialog-loader");
  function CodePlugin() {
  }
  S.augment(CodePlugin, {pluginRenderUI:function(editor) {
    editor.addButton("code", {tooltip:"\u63d2\u5165\u4ee3\u7801", listeners:{click:function() {
      DialogLoader.useDialog(editor, "code")
    }}, mode:Editor.Mode.WYSIWYG_MODE})
  }});
  return CodePlugin
});

