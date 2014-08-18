/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:26
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/strike-through/cmd
*/

KISSY.add("editor/plugin/strike-through/cmd", ["editor", "../font/cmd"], function(S, require) {
  var Editor = require("editor");
  var Cmd = require("../font/cmd");
  var STRIKE_STYLE = new Editor.Style({element:"del", overrides:[{element:"span", attributes:{style:"text-decoration: line-through;"}}, {element:"s"}, {element:"strike"}]});
  return{init:function(editor) {
    Cmd.addButtonCmd(editor, "strikeThrough", STRIKE_STYLE)
  }}
});

