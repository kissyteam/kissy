/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 13 17:48
*/
KISSY.add("component/plugin/resize",["resizable"],function(e,d){return d("resizable").extend({pluginBindUI:function(a){var b=a.$el;this.set("node",b);this.set("prefixCls",a.get("prefixCls"));this.on("resizeEnd",function(){var c=b.offset();a.setInternal("xy",[c.left,c.top]);a.setInternal("width",b.width());a.setInternal("height",b.height())})},pluginDestructor:function(){this.destroy()}})});
