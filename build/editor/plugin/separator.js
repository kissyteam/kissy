/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 14 22:22
*/
KISSY.add("editor/plugin/separator",["node"],function(d,b){function a(){}var c=b("node").all;a.prototype={pluginRenderUI:function(a){c('<span class="'+a.get("prefixCls")+'editor-toolbar-separator">&nbsp;</span>').appendTo(a.get("toolBarEl"))}};return a});
