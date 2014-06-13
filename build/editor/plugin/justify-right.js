/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:47
*/
KISSY.add("editor/plugin/justify-right",["editor","./justify-right/cmd","./button","node"],function(j,c,k,f){function g(){var a=this.get("editor");a.execCommand("justifyRight");a.focus()}function d(){}var e=c("editor"),h=c("./justify-right/cmd");c("./button");var i=c("node");d.prototype={pluginRenderUI:function(a){h.init(a);a.addButton("justifyRight",{tooltip:"\u53f3\u5bf9\u9f50",checkable:!0,listeners:{click:g,afterSyncUI:function(){var b=this;a.on("selectionChange",function(){a.get("mode")!==e.Mode.SOURCE_MODE&&
(a.queryCommandValue("justifyRight")?b.set("checked",!0):b.set("checked",!1))})}},mode:e.Mode.WYSIWYG_MODE});a.docReady(function(){a.get("document").on("keydown",function(b){b.ctrlKey&&b.keyCode===i.Event.KeyCode.R&&(a.execCommand("justifyRight"),b.preventDefault())})})}};f.exports=d});
