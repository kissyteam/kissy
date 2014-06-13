/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:46
*/
KISSY.add("editor/plugin/justify-center",["editor","./justify-center/cmd","./button","node"],function(j,c,k,f){function g(){var a=this.get("editor");a.execCommand("justifyCenter");a.focus()}function d(){}var e=c("editor"),h=c("./justify-center/cmd");c("./button");var i=c("node");d.prototype={pluginRenderUI:function(a){h.init(a);a.addButton("justifyCenter",{tooltip:"\u5c45\u4e2d\u5bf9\u9f50",checkable:!0,listeners:{click:g,afterSyncUI:function(){var b=this;a.on("selectionChange",function(){a.get("mode")!==e.Mode.SOURCE_MODE&&
(a.queryCommandValue("justifyCenter")?b.set("checked",!0):b.set("checked",!1))})}},mode:e.Mode.WYSIWYG_MODE});a.docReady(function(){a.get("document").on("keydown",function(b){b.ctrlKey&&b.keyCode===i.Event.KeyCode.E&&(a.execCommand("justifyCenter"),b.preventDefault())})})}};f.exports=d});
