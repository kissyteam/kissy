/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 7 00:48
*/
KISSY.add("editor/plugin/justifyLeft/index",function(e,d,c){function b(){var a=this.get("editor");a.execCommand("justifyLeft");a.focus()}return{init:function(a){c.init(a);a.addButton("justifyLeft",{tooltip:"左对齐",checkable:!0,mode:d.WYSIWYG_MODE},{onClick:b,offClick:b,selectionChange:function(b){var c=d.Utils.getQueryCmd("justifyLeft");a.execCommand(c,b.path)?this.set("checked",!0):this.set("checked",!1)}})}}},{requires:["editor","./cmd"]});
