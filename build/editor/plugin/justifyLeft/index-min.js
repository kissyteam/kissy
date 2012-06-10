/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 10 21:07
*/
KISSY.add("editor/plugin/justifyLeft/index",function(f,b,c){function d(){var a=this.get("editor");a.execCommand("justifyLeft");a.focus()}return{init:function(a){c.init(a);a.addButton("justifyLeft",{tooltip:"左对齐",checkable:!0,listeners:{click:{fn:d},afterSyncUI:{fn:function(){var e=this;a.on("selectionChange",function(c){if(a.get("mode")!=b.SOURCE_MODE){var d=b.Utils.getQueryCmd("justifyLeft");a.execCommand(d,c.path)?e.set("checked",!0):e.set("checked",!1)}})}}},mode:b.WYSIWYG_MODE})}}},{requires:["editor",
"./cmd"]});
