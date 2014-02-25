/*
Copyright 2014, KISSY v1.42
MIT Licensed
build time: Jan 6 12:47
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/font-family/cmd
*/

KISSY.add("editor/plugin/font-family/cmd", ["../font/cmd"], function(S, require) {
  var Cmd = require("../font/cmd");
  var fontFamilyStyle = {element:"span", styles:{"font-family":"#(value)"}, overrides:[{element:"font", attributes:{face:null}}]};
  return{init:function(editor) {
    Cmd.addSelectCmd(editor, "fontFamily", fontFamilyStyle)
  }}
});

