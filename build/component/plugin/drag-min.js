/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 3 14:39
*/
KISSY.add("component/plugin/drag",function(e,f,d){return d.Draggable.extend({pluginId:"component/plugin/drag",pluginBindUI:function(a){var b=a.$el;this.set("node",b);this.on("dragend",function(){var c=b.offset();a.setInternal("xy",[c.left,c.top])})},pluginDestructor:function(){this.destroy()}},{ATTRS:{move:{value:1},groups:{value:!1}}})},{requires:["rich-base","dd"]});
