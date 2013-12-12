/*
Copyright 2013, KISSY v1.50
MIT Licensed
build time: Dec 12 22:10
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/bold/cmd
*/

KISSY.add("editor/plugin/bold/cmd", ["editor", "../font/cmd"], function(S, require) {
  var Editor = require("editor");
  var Cmd = require("../font/cmd");
  var BOLD_STYLE = new Editor.Style({element:"strong", overrides:[{element:"b"}, {element:"span", attributes:{style:"font-weight: bold;"}}]});
  return{init:function(editor) {
    Cmd.addButtonCmd(editor, "bold", BOLD_STYLE)
  }}
});

