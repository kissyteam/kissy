/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:48
*/
KISSY.add("editor/plugin/overlay",["editor","overlay","./focus-fix"],function(a,b,c,d){var a=b("editor"),c=b("overlay"),e=b("./focus-fix");d.exports=c.extend({bindUI:function(){e.init(this)}},{ATTRS:{prefixCls:{value:"ks-editor-"},zIndex:{value:a.baseZIndex(a.ZIndexManager.OVERLAY)}}})});
