/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 29 15:01
*/
KISSY.add("editor/plugin/dialog","editor,overlay,./focus-fix,dd/plugin/constrain,component/plugin/drag,dom".split(","),function(h,a){var b=a("editor"),d=a("overlay"),e=a("./focus-fix"),f=a("dd/plugin/constrain"),g=a("component/plugin/drag"),c=a("dom");return d.Dialog.extend({initializer:function(){this.plug(new g({handlers:[".ks-editor-dialog-header"],plugins:[new f({constrain:window})]}))},bindUI:function(){e.init(this)},show:function(){this.center();var a=this.get("y");if(a-c.scrollTop()>200){a=
c.scrollTop()+200;this.set("y",a)}this.callSuper()}},{ATTRS:{prefixCls:{value:"ks-editor-"},zIndex:{value:b.baseZIndex(b.ZIndexManager.OVERLAY)}}})});
