/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 10 21:07
*/
KISSY.add("editor/plugin/maximize/index",function(c,d,b){return{init:function(a){b.init(a);a.addButton("maximize",{tooltip:"全屏",listeners:{click:{fn:function(){this.get("checked")?(a.execCommand("maximizeWindow"),this.set("tooltip","取消全屏"),this.set("contentCls","restore")):(a.execCommand("restoreWindow"),this.set("tooltip","全屏"),this.set("contentCls","maximize"));a.focus()}}},checkable:!0})}}},{requires:["editor","./cmd"]});
