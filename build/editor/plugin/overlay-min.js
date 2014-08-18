/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:25
*/
KISSY.add("editor/plugin/overlay",["editor","overlay","./focus-fix"],function(e,a){var b=a("editor"),c=a("overlay"),d=a("./focus-fix");return c.extend({bindUI:function(){d.init(this)}},{ATTRS:{prefixCls:{value:"ks-editor-"},zIndex:{value:b.baseZIndex(b.ZIndexManager.OVERLAY)}}})});
