/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:19
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

