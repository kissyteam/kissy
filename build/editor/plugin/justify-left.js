/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 14 22:20
*/
KISSY.add("editor/plugin/justify-left",["editor","./justify-left/cmd","./button","node"],function(i,c){function f(){var a=this.get("editor");a.execCommand("justifyLeft");a.focus()}function d(){}var e=c("editor"),g=c("./justify-left/cmd");c("./button");var h=c("node");d.prototype={pluginRenderUI:function(a){g.init(a);a.addButton("justifyLeft",{tooltip:"\u5de6\u5bf9\u9f50",checkable:!0,listeners:{click:f,afterSyncUI:function(){var b=this;a.on("selectionChange",function(){a.get("mode")!==e.Mode.SOURCE_MODE&&(a.queryCommandValue("justifyLeft")?
b.set("checked",!0):b.set("checked",!1))})}},mode:e.Mode.WYSIWYG_MODE});a.docReady(function(){a.get("document").on("keydown",function(b){b.ctrlKey&&b.keyCode===h.KeyCode.L&&(a.execCommand("justifyLeft"),b.preventDefault())})})}};return d});
