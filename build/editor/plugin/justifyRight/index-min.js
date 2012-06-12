/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 13 00:29
*/
KISSY.add("editor/plugin/justifyRight/index",function(f,b,c){function d(){var a=this.get("editor");a.execCommand("justifyRight");a.focus()}return{init:function(a){c.init(a);a.addButton("justifyRight",{tooltip:"右对齐",checkable:!0,listeners:{click:d,afterSyncUI:function(){var e=this;a.on("selectionChange",function(c){if(a.get("mode")!=b.SOURCE_MODE){var d=b.Utils.getQueryCmd("justifyRight");a.execCommand(d,c.path)?e.set("checked",!0):e.set("checked",!1)}})}},mode:b.WYSIWYG_MODE})}}},{requires:["editor",
"./cmd"]});
