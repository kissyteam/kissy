/*
Copyright 2013, KISSY v1.41
MIT Licensed
build time: Dec 4 22:07
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/back-color/cmd
*/

KISSY.add("editor/plugin/back-color/cmd", ["../color/cmd"], function(S, require) {
  var cmd = require("../color/cmd");
  var BACK_COLOR_STYLE = {element:"span", styles:{"background-color":"#(color)"}, overrides:[{element:"*", styles:{"background-color":null}}], childRule:function(currentNode) {
    return!!currentNode.style("background-color")
  }};
  return{init:function(editor) {
    if(!editor.hasCommand("backColor")) {
      editor.addCommand("backColor", {exec:function(editor, c) {
        editor.execCommand("save");
        cmd.applyColor(editor, c, BACK_COLOR_STYLE);
        editor.execCommand("save")
      }})
    }
  }}
});

