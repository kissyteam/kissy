/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Feb 17 17:29
*/
KISSY.add("editor/plugin/justify-center/index",function(c,d,f){function g(){var a=this.get("editor");a.execCommand("justifyCenter");a.focus()}function e(){}c.augment(e,{pluginRenderUI:function(a){f.init(a);a.addButton("justifyCenter",{tooltip:"居中对齐",checkable:!0,listeners:{click:g,afterSyncUI:function(){var b=this;a.on("selectionChange",function(){a.get("mode")!=d.SOURCE_MODE&&(a.queryCommandValue("justifyCenter")?b.set("checked",!0):b.set("checked",!1))})}},mode:d.WYSIWYG_MODE});a.docReady(function(){a.get("document").on("keydown",
function(b){b.ctrlKey&&b.keyCode==c.Node.KeyCodes.E&&(a.execCommand("justifyCenter"),b.preventDefault())})})}});return e},{requires:["editor","./cmd"]});
