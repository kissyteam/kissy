/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:25
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/outdent/cmd
*/

KISSY.add("editor/plugin/outdent/cmd", ["editor", "../dent-cmd"], function(S, require) {
  var Editor = require("editor");
  var dentUtils = require("../dent-cmd");
  var addCommand = dentUtils.addCommand;
  var checkOutdentActive = dentUtils.checkOutdentActive;
  return{init:function(editor) {
    addCommand(editor, "outdent");
    var queryCmd = Editor.Utils.getQueryCmd("outdent");
    if(!editor.hasCommand(queryCmd)) {
      editor.addCommand(queryCmd, {exec:function(editor) {
        var selection = editor.getSelection();
        if(selection && !selection.isInvalid) {
          var startElement = selection.getStartElement();
          var elementPath = new Editor.ElementPath(startElement);
          return checkOutdentActive(elementPath)
        }
      }})
    }
  }}
});

