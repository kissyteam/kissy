/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 5 21:37
*/
KISSY.add("editor/plugin/justifyCenter/index",function(e,d,b){function a(){this.get("editor").execCommand("justifyCenter")}return{init:function(c){b.init(c);c.addButton({contentCls:"ks-editor-toolbar-justifyCenter",title:"居中对齐",mode:d.WYSIWYG_MODE},{onClick:a,offClick:a,selectionChange:function(a){var b=d.Utils.getQueryCmd("justifyCenter");c.execCommand(b,a.path)?this.bon():this.boff()}})}}},{requires:["editor","./cmd"]});
