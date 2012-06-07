/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 7 15:13
*/
KISSY.add("editor/plugin/outdent/index",function(e,b,c){return{init:function(a){c.init(a);var d=b.Utils.getQueryCmd("outdent");a.addButton("outdent",{tooltip:"减少缩进量 ",mode:b.WYSIWYG_MODE},{offClick:function(){a.execCommand("outdent");a.focus()},selectionChange:function(b){a.execCommand(d,b.path)?this.set("disabled",!1):this.set("disabled",!0)}})}}},{requires:["editor","./cmd"]});
