/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:21
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

