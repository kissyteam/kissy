/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:23
*/
KISSY.add("editor/plugin/justify-right",["editor","./justify-right/cmd","./button"],function(d,c){function g(){var a=this.get("editor");a.execCommand("justifyRight");a.focus()}function e(){}var f=c("editor"),h=c("./justify-right/cmd");c("./button");d.augment(e,{pluginRenderUI:function(a){h.init(a);a.addButton("justifyRight",{tooltip:"\u53f3\u5bf9\u9f50",checkable:!0,listeners:{click:g,afterSyncUI:function(){var b=this;a.on("selectionChange",function(){a.get("mode")!==f.Mode.SOURCE_MODE&&(a.queryCommandValue("justifyRight")?
b.set("checked",!0):b.set("checked",!1))})}},mode:f.Mode.WYSIWYG_MODE});a.docReady(function(){a.get("document").on("keydown",function(b){b.ctrlKey&&b.keyCode===d.Node.KeyCode.R&&(a.execCommand("justifyRight"),b.preventDefault())})})}});return e});
