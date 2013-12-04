/*
Copyright 2013, KISSY v1.41
MIT Licensed
build time: Dec 4 22:13
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

