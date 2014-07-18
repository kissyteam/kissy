/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 13:53
*/
KISSY.add("component/plugin/drag",["dd"],function(a,c,f,d){function e(){var b=this.component,a=b.$el.offset();b.setInternal("xy",[a.left,a.top])}a=c("dd");d.exports=a.Draggable.extend({pluginId:"component/plugin/drag",pluginBindUI:function(a){this.set("node",a.$el);this.start();this.component=a;this.on("dragend",e)},pluginDestructor:function(){this.destroy()}},{ATTRS:{move:{value:1},groups:{value:!1}}})});
