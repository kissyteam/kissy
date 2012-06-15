/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 15 12:07
*/
KISSY.add("editor/plugin/justifyCenter/index",function(c,d,e){function f(){var a=this.get("editor");a.execCommand("justifyCenter");a.focus()}function b(){}c.augment(b,{renderUI:function(a){e.init(a);a.addButton("justifyCenter",{tooltip:"居中对齐",checkable:!0,listeners:{click:f,afterSyncUI:function(){var b=this;a.on("selectionChange",function(c){if(a.get("mode")!=d.SOURCE_MODE){var e=d.Utils.getQueryCmd("justifyCenter");a.execCommand(e,c.path)?b.set("checked",!0):b.set("checked",!1)}})}},mode:d.WYSIWYG_MODE})}});
return b},{requires:["editor","./cmd"]});
