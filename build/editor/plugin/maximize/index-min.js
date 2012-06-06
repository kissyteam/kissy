/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 7 00:48
*/
KISSY.add("editor/plugin/maximize/index",function(c,d,b){return{init:function(a){b.init(a);a.addButton("maximize",{tooltip:"全屏",checkable:!0},{onClick:function(){a.execCommand("restoreWindow");this.set("tooltip","全屏");this.set("contentCls","maximize");a.focus()},offClick:function(){a.execCommand("maximizeWindow");this.set("tooltip","取消全屏");this.set("contentCls","restore");a.focus()}})}}},{requires:["editor","./cmd"]});
