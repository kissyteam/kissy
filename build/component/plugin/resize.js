/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 13:53
*/
KISSY.add("component/plugin/resize",["resizable"],function(a,d,f,e){a=d("resizable");e.exports=a.extend({pluginBindUI:function(b){var c=b.$el;this.set("node",c);this.set("prefixCls",b.get("prefixCls"));this.on("resizeEnd",function(){var a=c.offset();b.setInternal("xy",[a.left,a.top]);b.setInternal("width",c.width());b.setInternal("height",c.height())})},pluginDestructor:function(){this.destroy()}})});
