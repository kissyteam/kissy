/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 13 17:48
*/
/*
 Combined modules by KISSY Module Compiler: 

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

