/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:23
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/justify-right
*/

KISSY.add("editor/plugin/justify-right", ["editor", "./justify-right/cmd", "./button"], function(S, require) {
  var Editor = require("editor");
  var justifyCenterCmd = require("./justify-right/cmd");
  require("./button");
  function exec() {
    var editor = this.get("editor");
    editor.execCommand("justifyRight");
    editor.focus()
  }
  function justifyRight() {
  }
  S.augment(justifyRight, {pluginRenderUI:function(editor) {
    justifyCenterCmd.init(editor);
    editor.addButton("justifyRight", {tooltip:"\u53f3\u5bf9\u9f50", checkable:true, listeners:{click:exec, afterSyncUI:function() {
      var self = this;
      editor.on("selectionChange", function() {
        if(editor.get("mode") === Editor.Mode.SOURCE_MODE) {
          return
        }
        if(editor.queryCommandValue("justifyRight")) {
          self.set("checked", true)
        }else {
          self.set("checked", false)
        }
      })
    }}, mode:Editor.Mode.WYSIWYG_MODE});
    editor.docReady(function() {
      editor.get("document").on("keydown", function(e) {
        if(e.ctrlKey && e.keyCode === S.Node.KeyCode.R) {
          editor.execCommand("justifyRight");
          e.preventDefault()
        }
      })
    })
  }});
  return justifyRight
});

