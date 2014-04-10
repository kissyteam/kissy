/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 10 18:42
*/
/*
 Combined modules by KISSY Module Compiler: 

 editor/plugin/justify-center/cmd
*/

KISSY.add("editor/plugin/justify-center/cmd", ["../justify-cmd"], function(S, require) {
  var justifyUtils = require("../justify-cmd");
  return{init:function(editor) {
    justifyUtils.addCommand(editor, "justifyCenter", "center")
  }}
});

