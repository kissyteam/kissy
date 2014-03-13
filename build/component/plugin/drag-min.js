/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 13 21:21
*/
KISSY.add("component/plugin/drag",["dd"],function(e,c){function d(){var a=this.component,b=a.$el.offset();a.setInternal("xy",[b.left,b.top])}return c("dd").Draggable.extend({pluginId:"component/plugin/drag",pluginBindUI:function(a){this.set("node",a.$el);this.start();this.component=a;this.on("dragend",d)},pluginDestructor:function(){this.destroy()}},{ATTRS:{move:{value:1},groups:{value:!1}}})});
