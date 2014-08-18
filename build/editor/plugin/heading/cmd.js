/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:22
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/heading/cmd
*/

KISSY.add("editor/plugin/heading/cmd", ["editor"], function(S, require) {
  var Editor = require("editor");
  return{init:function(editor) {
    if(!editor.hasCommand("heading")) {
      editor.addCommand("heading", {exec:function(editor, tag) {
        var currentValue;
        editor.execCommand("save");
        if(tag !== "p") {
          currentValue = editor.queryCommandValue("heading")
        }
        if(tag === currentValue) {
          tag = "p"
        }
        (new Editor.Style({element:tag})).apply(editor.get("document")[0]);
        editor.execCommand("save")
      }});
      var queryCmd = Editor.Utils.getQueryCmd("heading");
      editor.addCommand(queryCmd, {exec:function(editor) {
        var selection = editor.getSelection();
        if(selection && !selection.isInvalid) {
          var startElement = selection.getStartElement();
          var currentPath = new Editor.ElementPath(startElement);
          var block = currentPath.block || currentPath.blockLimit;
          var nodeName = block && block.nodeName() || "";
          if(nodeName.match(/^h\d$/) || nodeName === "p") {
            return nodeName
          }
        }
      }})
    }
  }}
});

