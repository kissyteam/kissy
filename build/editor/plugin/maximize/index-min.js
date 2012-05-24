/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 24 18:37
*/
KISSY.add("editor/plugin/maximize/index",function(c,d,b){return{init:function(a){b.init(a);a.addButton({title:"全屏",contentCls:"ke-toolbar-maximize"},{onClick:function(){a.execCommand("restoreWindow");this.boff();this.set("title","全屏");this.set("contentCls","ke-toolbar-maximize")},offClick:function(){a.execCommand("maximizeWindow");this.bon();this.set("title","取消全屏");this.set("contentCls","ke-toolbar-restore")}})}}},{requires:["editor","./cmd"]});
