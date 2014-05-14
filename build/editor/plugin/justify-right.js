/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 14 22:21
*/
KISSY.add("editor/plugin/justify-right",["editor","./justify-right/cmd","./button","node"],function(i,c){function f(){var a=this.get("editor");a.execCommand("justifyRight");a.focus()}function d(){}var e=c("editor"),g=c("./justify-right/cmd");c("./button");var h=c("node");d.prototype={pluginRenderUI:function(a){g.init(a);a.addButton("justifyRight",{tooltip:"\u53f3\u5bf9\u9f50",checkable:!0,listeners:{click:f,afterSyncUI:function(){var b=this;a.on("selectionChange",function(){a.get("mode")!==e.Mode.SOURCE_MODE&&(a.queryCommandValue("justifyRight")?
b.set("checked",!0):b.set("checked",!1))})}},mode:e.Mode.WYSIWYG_MODE});a.docReady(function(){a.get("document").on("keydown",function(b){b.ctrlKey&&b.keyCode===h.KeyCode.R&&(a.execCommand("justifyRight"),b.preventDefault())})})}};return d});
