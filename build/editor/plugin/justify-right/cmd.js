/*
Copyright 2014, KISSY v1.42
MIT Licensed
build time: Jan 6 12:48
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/justify-right/cmd
*/

KISSY.add("editor/plugin/justify-right/cmd", ["../justify-cmd"], function(S, require) {
  var justifyUtils = require("../justify-cmd");
  return{init:function(editor) {
    justifyUtils.addCommand(editor, "justifyRight", "right")
  }}
});

