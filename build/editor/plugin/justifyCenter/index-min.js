/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 7 15:13
*/
KISSY.add("editor/plugin/justifyCenter/index",function(e,d,c){function b(){var a=this.get("editor");a.execCommand("justifyCenter");a.focus()}return{init:function(a){c.init(a);a.addButton("justifyCenter",{tooltip:"居中对齐",checkable:!0,mode:d.WYSIWYG_MODE},{onClick:b,offClick:b,selectionChange:function(b){var c=d.Utils.getQueryCmd("justifyCenter");a.execCommand(c,b.path)?this.set("checked",!0):this.set("checked",!1)}})}}},{requires:["editor","./cmd"]});
