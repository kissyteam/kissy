/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 10 18:45
*/
/*
 Combined modules by KISSY Module Compiler: 

 editor/plugin/underline
*/

KISSY.add("editor/plugin/underline", ["./font/ui", "./underline/cmd", "./button"], function(S, require) {
  var ui = require("./font/ui");
  var cmd = require("./underline/cmd");
  require("./button");
  function Underline() {
  }
  S.augment(Underline, {pluginRenderUI:function(editor) {
    cmd.init(editor);
    editor.addButton("underline", {cmdType:"underline", tooltip:"\u4e0b\u5212\u7ebf"}, ui.Button);
    editor.docReady(function() {
      editor.get("document").on("keydown", function(e) {
        if(e.ctrlKey && e.keyCode === S.Node.KeyCode.U) {
          editor.execCommand("underline");
          e.preventDefault()
        }
      })
    })
  }});
  return Underline
});

