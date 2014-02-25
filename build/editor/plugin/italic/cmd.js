/*
Copyright 2014, KISSY v1.42
MIT Licensed
build time: Jan 6 12:48
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/italic/cmd
*/

KISSY.add("editor/plugin/italic/cmd", ["editor", "../font/cmd"], function(S, require) {
  var Editor = require("editor");
  var Cmd = require("../font/cmd");
  var ITALIC_STYLE = new Editor.Style({element:"em", overrides:[{element:"i"}, {element:"span", attributes:{style:"font-style: italic;"}}]});
  return{init:function(editor) {
    Cmd.addButtonCmd(editor, "italic", ITALIC_STYLE)
  }}
});

