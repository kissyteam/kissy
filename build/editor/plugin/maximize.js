/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 14 22:21
*/
KISSY.add("editor/plugin/maximize",["./maximize/cmd","./button"],function(e,b){function c(){}var d=b("./maximize/cmd");b("./button");c.prototype={pluginRenderUI:function(a){d.init(a);a.addButton("maximize",{tooltip:"\u5168\u5c4f",listeners:{click:function(){this.get("checked")?(a.execCommand("maximizeWindow"),this.set("tooltip","\u53d6\u6d88\u5168\u5c4f"),this.set("contentCls","restore")):(a.execCommand("restoreWindow"),this.set("tooltip","\u5168\u5c4f"),this.set("contentCls","maximize"));a.focus()}},checkable:!0})}};return c});
