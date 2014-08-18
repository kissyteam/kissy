/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:23
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/justify-center
*/

KISSY.add("editor/plugin/justify-center", ["editor", "./justify-center/cmd", "./button"], function(S, require) {
  var Editor = require("editor");
  var justifyCenterCmd = require("./justify-center/cmd");
  require("./button");
  function exec() {
    var editor = this.get("editor");
    editor.execCommand("justifyCenter");
    editor.focus()
  }
  function justifyCenter() {
  }
  S.augment(justifyCenter, {pluginRenderUI:function(editor) {
    justifyCenterCmd.init(editor);
    editor.addButton("justifyCenter", {tooltip:"\u5c45\u4e2d\u5bf9\u9f50", checkable:true, listeners:{click:exec, afterSyncUI:function() {
      var self = this;
      editor.on("selectionChange", function() {
        if(editor.get("mode") === Editor.Mode.SOURCE_MODE) {
          return
        }
        if(editor.queryCommandValue("justifyCenter")) {
          self.set("checked", true)
        }else {
          self.set("checked", false)
        }
      })
    }}, mode:Editor.Mode.WYSIWYG_MODE});
    editor.docReady(function() {
      editor.get("document").on("keydown", function(e) {
        if(e.ctrlKey && e.keyCode === S.Node.KeyCode.E) {
          editor.execCommand("justifyCenter");
          e.preventDefault()
        }
      })
    })
  }});
  return justifyCenter
});

