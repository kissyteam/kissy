/*
Copyright 2012, KISSY UI Library v1.30rc
MIT Licensed
build time: Jul 5 23:31
*/
KISSY.add("editor/plugin/maximize/index",function(c,e,d){function b(){}c.augment(b,{renderUI:function(a){d.init(a);a.addButton("maximize",{tooltip:"全屏",listeners:{click:function(){this.get("checked")?(a.execCommand("maximizeWindow"),this.set("tooltip","取消全屏"),this.set("contentCls","restore")):(a.execCommand("restoreWindow"),this.set("tooltip","全屏"),this.set("contentCls","maximize"));a.focus()}},checkable:!0})}});return b},{requires:["editor","./cmd"]});
