/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 13 17:58
*/
/*
 Combined modules by KISSY Module Compiler: 

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

