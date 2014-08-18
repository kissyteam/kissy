/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:24
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/ordered-list/cmd
*/

KISSY.add("editor/plugin/ordered-list/cmd", ["editor", "../list-utils/cmd"], function(S, require) {
  var Editor = require("editor");
  var listCmd = require("../list-utils/cmd");
  var insertOrderedList = "insertOrderedList", ListCommand = listCmd.ListCommand, queryActive = listCmd.queryActive, olCmd = new ListCommand("ol");
  return{init:function(editor) {
    if(!editor.hasCommand(insertOrderedList)) {
      editor.addCommand(insertOrderedList, {exec:function(editor, listStyleType) {
        editor.focus();
        olCmd.exec(editor, listStyleType)
      }})
    }
    var queryOl = Editor.Utils.getQueryCmd(insertOrderedList);
    if(!editor.hasCommand(queryOl)) {
      editor.addCommand(queryOl, {exec:function(editor) {
        var selection = editor.getSelection();
        if(selection && !selection.isInvalid) {
          var startElement = selection.getStartElement();
          var elementPath = new Editor.ElementPath(startElement);
          return queryActive("ol", elementPath)
        }
      }})
    }
  }}
});

