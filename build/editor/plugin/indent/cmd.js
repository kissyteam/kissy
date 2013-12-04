/*
Copyright 2013, KISSY v1.41
MIT Licensed
build time: Dec 4 22:10
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/indent/cmd
*/

KISSY.add("editor/plugin/indent/cmd", ["../dent-cmd"], function(S, require) {
  var dentUtils = require("../dent-cmd");
  var addCommand = dentUtils.addCommand;
  return{init:function(editor) {
    addCommand(editor, "indent")
  }}
});

