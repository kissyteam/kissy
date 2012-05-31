/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 31 22:01
*/
KISSY.add("editor/plugin/outdent/index",function(e,a,c){return{init:function(b){c.init(b);var d=a.Utils.getQueryCmd("outdent");b.addButton({title:"减少缩进量 ",mode:a.WYSIWYG_MODE,contentCls:"ks-editor-toolbar-outdent"},{offClick:function(){b.execCommand("outdent")},selectionChange:function(a){b.execCommand(d,a.path)?this.enable():this.disable()}})}}},{requires:["editor","./cmd"]});
