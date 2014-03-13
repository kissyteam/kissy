/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 13 21:21
*/
/*
 Combined modules by KISSY Module Compiler: 

 component/plugin/drag
*/

KISSY.add("component/plugin/drag", ["dd"], function(S, require) {
  var DD = require("dd");
  function onDragEnd() {
    var component = this.component;
    var offset = component.$el.offset();
    component.setInternal("xy", [offset.left, offset.top])
  }
  return DD.Draggable.extend({pluginId:"component/plugin/drag", pluginBindUI:function(component) {
    this.set("node", component.$el);
    this.start();
    this.component = component;
    this.on("dragend", onDragEnd)
  }, pluginDestructor:function() {
    this.destroy()
  }}, {ATTRS:{move:{value:1}, groups:{value:false}}})
});

