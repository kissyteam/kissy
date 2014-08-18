/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:26
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/source-area
*/

KISSY.add("editor/plugin/source-area", ["editor", "./button"], function(S, require) {
  var Editor = require("editor");
  require("./button");
  var SOURCE_MODE = Editor.Mode.SOURCE_MODE, WYSIWYG_MODE = Editor.Mode.WYSIWYG_MODE;
  function sourceArea() {
  }
  S.augment(sourceArea, {pluginRenderUI:function(editor) {
    editor.addButton("sourceArea", {tooltip:"\u6e90\u7801", listeners:{afterSyncUI:function() {
      var self = this;
      editor.on("wysiwygMode", function() {
        self.set("checked", false)
      });
      editor.on("sourceMode", function() {
        self.set("checked", true)
      })
    }, click:function() {
      var self = this;
      var checked = self.get("checked");
      if(checked) {
        editor.set("mode", SOURCE_MODE)
      }else {
        editor.set("mode", WYSIWYG_MODE)
      }
    }}, checkable:true})
  }});
  return sourceArea
});

