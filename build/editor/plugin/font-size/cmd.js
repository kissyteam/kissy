/*
Copyright 2013, KISSY v1.50
MIT Licensed
build time: Dec 10 21:06
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

