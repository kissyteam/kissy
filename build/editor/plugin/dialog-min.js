/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:16
*/
KISSY.add("editor/plugin/dialog",function(b,c,e,f,g,h){var d=e.Dialog.extend({initializer:function(){this.plug(new h({handlers:[".ks-editor-stdmod-header"],plugins:[new g({constrain:window})]}))},bindUI:function(){f.init(this)},show:function(){this.center();var a=this.get("y");200<a-b.DOM.scrollTop()&&(a=b.DOM.scrollTop()+200,this.set("y",a));d.superclass.show.call(this)}},{ATTRS:{prefixCls:{value:"ks-editor-"},zIndex:{value:c.baseZIndex(c.zIndexManager.OVERLAY)}}});return d},{requires:["editor",
"overlay","./focus-fix","dd/plugin/constrain","component/plugin/drag"]});
