/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 30 20:27
*/
KISSY.add("editor/plugin/justifyLeft/index",function(e,d,b){function a(){this.get("editor").execCommand("justifyLeft")}return{init:function(c){b.init(c);c.addButton({contentCls:"ke-toolbar-justifyLeft",title:"左对齐",mode:d.WYSIWYG_MODE},{onClick:a,offClick:a,selectionChange:function(a){var b=d.Utils.getQueryCmd("justifyLeft");c.execCommand(b,a.path)?this.bon():this.boff()}})}}},{requires:["editor","./cmd"]});
