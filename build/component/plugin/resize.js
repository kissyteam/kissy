/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:17
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 component/plugin/resize
*/

KISSY.add("component/plugin/resize", ["resizable"], function(S, require) {
  var Resizable = require("resizable");
  return Resizable.extend({pluginBindUI:function(component) {
    var $el = component.$el, self = this;
    self.set("node", $el);
    self.set("prefixCls", component.get("prefixCls"));
    self.on("resizeEnd", function() {
      var offset = $el.offset();
      component.setInternal("xy", [offset.left, offset.top]);
      component.setInternal("width", $el.width());
      component.setInternal("height", $el.height())
    })
  }, pluginDestructor:function() {
    this.destroy()
  }})
});

