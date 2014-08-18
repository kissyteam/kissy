/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:24
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/maximize
*/

KISSY.add("editor/plugin/maximize", ["./maximize/cmd", "./button"], function(S, require) {
  var maximizeCmd = require("./maximize/cmd");
  require("./button");
  var MAXIMIZE_CLASS = "maximize", RESTORE_CLASS = "restore", MAXIMIZE_TIP = "\u5168\u5c4f", RESTORE_TIP = "\u53d6\u6d88\u5168\u5c4f";
  function maximizePlugin() {
  }
  S.augment(maximizePlugin, {pluginRenderUI:function(editor) {
    maximizeCmd.init(editor);
    editor.addButton("maximize", {tooltip:MAXIMIZE_TIP, listeners:{click:function() {
      var self = this;
      var checked = self.get("checked");
      if(checked) {
        editor.execCommand("maximizeWindow");
        self.set("tooltip", RESTORE_TIP);
        self.set("contentCls", RESTORE_CLASS)
      }else {
        editor.execCommand("restoreWindow");
        self.set("tooltip", MAXIMIZE_TIP);
        self.set("contentCls", MAXIMIZE_CLASS)
      }
      editor.focus()
    }}, checkable:true})
  }});
  return maximizePlugin
});

