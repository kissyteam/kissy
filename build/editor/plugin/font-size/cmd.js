/*
Copyright 2014, KISSY v1.42
MIT Licensed
build time: Jan 6 12:47
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/font-size/cmd
*/

KISSY.add("editor/plugin/font-size/cmd", ["../font/cmd"], function(S, require) {
  var Cmd = require("../font/cmd");
  var fontSizeStyle = {element:"span", styles:{"font-size":"#(value)"}, overrides:[{element:"font", attributes:{size:null}}]};
  return{init:function(editor) {
    Cmd.addSelectCmd(editor, "fontSize", fontSizeStyle)
  }}
});

