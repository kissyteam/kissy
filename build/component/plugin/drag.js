/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:17
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 component/plugin/drag
*/

KISSY.add("component/plugin/drag", ["dd"], function(S, require) {
  var DD = require("dd");
  return DD.Draggable.extend({pluginId:"component/plugin/drag", pluginBindUI:function(component) {
    var $el = component.$el, self = this;
    self.set("node", $el);
    self.on("dragend", function() {
      var offset = $el.offset();
      component.setInternal("xy", [offset.left, offset.top])
    })
  }, pluginDestructor:function() {
    this.destroy()
  }}, {ATTRS:{move:{value:1}, groups:{value:false}}})
});

