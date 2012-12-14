/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Dec 14 17:35
*/
KISSY.add("editor/plugin/separator/index",function(b){function a(){}b.augment(a,{pluginRenderUI:function(a){b.all('<span class="'+a.get("prefixCls")+'editor-toolbar-separator">&nbsp;</span>').appendTo(a.get("toolBarEl"))}});return a},{requires:["editor"]});
