/*
Copyright 2013, KISSY v1.50dev
MIT Licensed
build time: Dec 2 15:21
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/underline/cmd
*/

KISSY.add("editor/plugin/underline/cmd", ["editor", "../font/cmd"], function(S, require) {
  var Editor = require("editor");
  var Cmd = require("../font/cmd");
  var UNDERLINE_STYLE = new Editor.Style({element:"u", overrides:[{element:"span", attributes:{style:"text-decoration: underline;"}}]});
  return{init:function(editor) {
    Cmd.addButtonCmd(editor, "underline", UNDERLINE_STYLE)
  }}
});

