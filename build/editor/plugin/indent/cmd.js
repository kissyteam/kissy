/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:22
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

