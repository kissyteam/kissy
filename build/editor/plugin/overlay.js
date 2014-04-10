/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 10 18:43
*/
/*
 Combined modules by KISSY Module Compiler: 

 editor/plugin/overlay
*/

KISSY.add("editor/plugin/overlay", ["editor", "overlay", "./focus-fix"], function(S, require) {
  var Editor = require("editor");
  var Overlay = require("overlay");
  var focusFix = require("./focus-fix");
  return Overlay.extend({bindUI:function() {
    focusFix.init(this)
  }}, {ATTRS:{prefixCls:{value:"ks-editor-"}, zIndex:{value:Editor.baseZIndex(Editor.ZIndexManager.OVERLAY)}}})
});

