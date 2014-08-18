/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:23
*/
KISSY.add("editor/plugin/justify-center",["editor","./justify-center/cmd","./button"],function(d,c){function g(){var a=this.get("editor");a.execCommand("justifyCenter");a.focus()}function e(){}var f=c("editor"),h=c("./justify-center/cmd");c("./button");d.augment(e,{pluginRenderUI:function(a){h.init(a);a.addButton("justifyCenter",{tooltip:"\u5c45\u4e2d\u5bf9\u9f50",checkable:!0,listeners:{click:g,afterSyncUI:function(){var b=this;a.on("selectionChange",function(){a.get("mode")!==f.Mode.SOURCE_MODE&&(a.queryCommandValue("justifyCenter")?
b.set("checked",!0):b.set("checked",!1))})}},mode:f.Mode.WYSIWYG_MODE});a.docReady(function(){a.get("document").on("keydown",function(b){b.ctrlKey&&b.keyCode===d.Node.KeyCode.E&&(a.execCommand("justifyCenter"),b.preventDefault())})})}});return e});
