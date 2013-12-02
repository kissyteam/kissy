/*
Copyright 2013, KISSY v1.50dev
MIT Licensed
build time: Dec 2 12:58
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

