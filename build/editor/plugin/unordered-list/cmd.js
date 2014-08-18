/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:27
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/unordered-list/cmd
*/

KISSY.add("editor/plugin/unordered-list/cmd", ["editor", "../list-utils/cmd"], function(S, require) {
  var Editor = require("editor");
  var listCmd = require("../list-utils/cmd");
  var insertUnorderedList = "insertUnorderedList", ListCommand = listCmd.ListCommand, queryActive = listCmd.queryActive, ulCmd = new ListCommand("ul");
  return{init:function(editor) {
    if(!editor.hasCommand(insertUnorderedList)) {
      editor.addCommand(insertUnorderedList, {exec:function(editor, type) {
        editor.focus();
        ulCmd.exec(editor, type)
      }})
    }
    var queryUl = Editor.Utils.getQueryCmd(insertUnorderedList);
    if(!editor.hasCommand(queryUl)) {
      editor.addCommand(queryUl, {exec:function(editor) {
        var selection = editor.getSelection();
        if(selection && !selection.isInvalid) {
          var startElement = selection.getStartElement();
          var elementPath = new Editor.ElementPath(startElement);
          return queryActive("ul", elementPath)
        }
      }})
    }
  }}
});

