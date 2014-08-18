/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:24
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/outdent
*/

KISSY.add("editor/plugin/outdent", ["editor", "./button", "./outdent/cmd"], function(S, require) {
  var Editor = require("editor");
  require("./button");
  var indexCmd = require("./outdent/cmd");
  function outdent() {
  }
  S.augment(outdent, {pluginRenderUI:function(editor) {
    indexCmd.init(editor);
    editor.addButton("outdent", {tooltip:"\u51cf\u5c11\u7f29\u8fdb\u91cf", listeners:{click:function() {
      editor.execCommand("outdent");
      editor.focus()
    }, afterSyncUI:function() {
      var self = this;
      editor.on("selectionChange", function() {
        if(editor.get("mode") === Editor.Mode.SOURCE_MODE) {
          return
        }
        if(editor.queryCommandValue("outdent")) {
          self.set("disabled", false)
        }else {
          self.set("disabled", true)
        }
      })
    }}, mode:Editor.Mode.WYSIWYG_MODE})
  }});
  return outdent
});

