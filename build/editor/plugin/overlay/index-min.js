/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Feb 17 17:29
*/
KISSY.add("editor/plugin/overlay/index",function(c,a,d,e,f,g){var b=d.extend({bindUI:function(){e.init(this)}},{ATTRS:{prefixCls:{value:"ks-editor-"},zIndex:{value:a.baseZIndex(a.zIndexManager.OVERLAY)}}});b.Dialog=d.Dialog.extend({bindUI:function(){e.init(this)},show:function(){this.center();var a=this.get("y");200<a-c.DOM.scrollTop()&&(a=c.DOM.scrollTop()+200,this.set("y",a));b.prototype.show.call(this)}},{ATTRS:{prefixCls:{value:"ks-editor-"},zIndex:{value:a.baseZIndex(a.zIndexManager.OVERLAY)},
plugins:{value:[new g({handlers:[".ks-editor-stdmod-header"],plugins:[new f({constrain:window})]})]}}});return b},{requires:["editor","overlay","../focus-fix/","dd/plugin/constrain","component/plugin/drag"]});
