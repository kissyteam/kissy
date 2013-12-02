/*
Copyright 2013, KISSY v1.50dev
MIT Licensed
build time: Dec 2 15:18
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

