/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:20
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/dialog
*/

KISSY.add("editor/plugin/dialog", ["editor", "overlay", "./focus-fix", "dd/plugin/constrain", "component/plugin/drag"], function(S, require) {
  var Editor = require("editor");
  var Overlay = require("overlay");
  var focusFix = require("./focus-fix");
  var ConstrainPlugin = require("dd/plugin/constrain");
  var DragPlugin = require("component/plugin/drag");
  return Overlay.Dialog.extend({initializer:function() {
    this.plug(new DragPlugin({handlers:[".ks-editor-dialog-header"], plugins:[new ConstrainPlugin({constrain:window})]}))
  }, bindUI:function() {
    focusFix.init(this)
  }, show:function() {
    var self = this;
    self.center();
    var y = self.get("y");
    if(y - S.DOM.scrollTop() > 200) {
      y = S.DOM.scrollTop() + 200;
      self.set("y", y)
    }
    self.callSuper()
  }}, {ATTRS:{prefixCls:{value:"ks-editor-"}, zIndex:{value:Editor.baseZIndex(Editor.ZIndexManager.OVERLAY)}}})
});

