/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: May 23 00:50
*/
KISSY.add("editor/plugin/separator",function(b){function a(){}b.augment(a,{pluginRenderUI:function(a){b.all('<span class="'+a.prefixCls+'editor-toolbar-separator">&nbsp;</span>').appendTo(a.get("toolBarEl"))}});return a},{requires:["editor"]});
