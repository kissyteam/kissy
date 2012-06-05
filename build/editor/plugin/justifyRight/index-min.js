/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 5 21:37
*/
KISSY.add("editor/plugin/justifyRight/index",function(e,d,b){function a(){this.get("editor").execCommand("justifyRight")}return{init:function(c){b.init(c);c.addButton({contentCls:"ks-editor-toolbar-justifyRight",title:"右对齐",mode:d.WYSIWYG_MODE},{onClick:a,offClick:a,selectionChange:function(a){var b=d.Utils.getQueryCmd("justifyRight");c.execCommand(b,a.path)?this.bon():this.boff()}})}}},{requires:["editor","./cmd"]});
