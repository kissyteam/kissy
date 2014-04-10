/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 10 18:41
*/
/*
 Combined modules by KISSY Module Compiler: 

 editor/plugin/indent/cmd
*/

KISSY.add("editor/plugin/indent/cmd", ["../dent-cmd"], function(S, require) {
  var dentUtils = require("../dent-cmd");
  var addCommand = dentUtils.addCommand;
  return{init:function(editor) {
    addCommand(editor, "indent")
  }}
});

