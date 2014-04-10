/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 10 18:39
*/
KISSY.add("editor/plugin/dialog",["editor","overlay","./focus-fix","dd/plugin/constrain","component/plugin/drag"],function(b,a){var c=a("editor"),d=a("overlay"),e=a("./focus-fix"),f=a("dd/plugin/constrain"),g=a("component/plugin/drag");return d.Dialog.extend({initializer:function(){this.plug(new g({handlers:[".ks-editor-dialog-header"],plugins:[new f({constrain:window})]}))},bindUI:function(){e.init(this)},show:function(){this.center();var a=this.get("y");200<a-b.require("dom").scrollTop()&&(a=b.require("dom").scrollTop()+
200,this.set("y",a));this.callSuper()}},{ATTRS:{prefixCls:{value:"ks-editor-"},zIndex:{value:c.baseZIndex(c.ZIndexManager.OVERLAY)}}})});
