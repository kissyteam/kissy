/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:23
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/justify-left/cmd
*/

KISSY.add("editor/plugin/justify-left/cmd", ["../justify-cmd"], function(S, require) {
  var justifyUtils = require("../justify-cmd");
  return{init:function(editor) {
    justifyUtils.addCommand(editor, "justifyLeft", "left")
  }}
});

