/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 13 00:29
*/
KISSY.add("editor/plugin/justifyCenter/index",function(f,b,c){function d(){var a=this.get("editor");a.execCommand("justifyCenter");a.focus()}return{init:function(a){c.init(a);a.addButton("justifyCenter",{tooltip:"居中对齐",checkable:!0,listeners:{click:d,afterSyncUI:function(){var e=this;a.on("selectionChange",function(c){if(a.get("mode")!=b.SOURCE_MODE){var d=b.Utils.getQueryCmd("justifyCenter");a.execCommand(d,c.path)?e.set("checked",!0):e.set("checked",!1)}})}},mode:b.WYSIWYG_MODE})}}},{requires:["editor",
"./cmd"]});
