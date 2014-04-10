/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 10 18:38
*/
/*
 Combined modules by KISSY Module Compiler: 

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

