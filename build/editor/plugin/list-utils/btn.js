/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:24
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/list-utils/btn
*/

KISSY.add("editor/plugin/list-utils/btn", ["editor", "../button", "../menubutton"], function(S, require) {
  var Editor = require("editor");
  require("../button");
  require("../menubutton");
  return{init:function(editor, cfg) {
    var buttonId = cfg.buttonId, cmdType = cfg.cmdType, tooltip = cfg.tooltip;
    var button = editor.addButton(buttonId, {elCls:buttonId + "Btn", mode:Editor.Mode.WYSIWYG_MODE, tooltip:"\u8bbe\u7f6e" + tooltip});
    editor.on("selectionChange", function() {
      var v;
      if(v = editor.queryCommandValue(cmdType)) {
        button.set("checked", true);
        arrow.set("value", v)
      }else {
        button.set("checked", false)
      }
    });
    var arrow = editor.addSelect(buttonId + "Arrow", {tooltip:"\u9009\u62e9\u5e76\u8bbe\u7f6e" + tooltip, mode:Editor.Mode.WYSIWYG_MODE, menu:cfg.menu, matchElWidth:false, elCls:"toolbar-" + buttonId + "ArrowBtn"});
    arrow.on("click", function(e) {
      var v = e.target.get("value");
      button.listValue = v;
      editor.execCommand(cmdType, v);
      editor.focus()
    });
    button.on("click", function() {
      var v = button.listValue;
      if(button.get("checked")) {
        v = arrow.get("value")
      }
      editor.execCommand(cmdType, v);
      editor.focus()
    })
  }}
});

