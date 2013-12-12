/*
Copyright 2013, KISSY v1.50
MIT Licensed
build time: Dec 12 22:14
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/justify-center/cmd
*/

KISSY.add("editor/plugin/justify-center/cmd", ["../justify-cmd"], function(S, require) {
  var justifyUtils = require("../justify-cmd");
  return{init:function(editor) {
    justifyUtils.addCommand(editor, "justifyCenter", "center")
  }}
});

