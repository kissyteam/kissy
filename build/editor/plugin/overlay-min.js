/*
Copyright 2014, KISSY v1.42
MIT Licensed
build time: Jan 6 12:50
*/
KISSY.add("editor/plugin/overlay",["editor","overlay","./focus-fix"],function(e,a){var b=a("editor"),c=a("overlay"),d=a("./focus-fix");return c.extend({bindUI:function(){d.init(this)}},{ATTRS:{prefixCls:{value:"ks-editor-"},zIndex:{value:b.baseZIndex(b.ZIndexManager.OVERLAY)}}})});
