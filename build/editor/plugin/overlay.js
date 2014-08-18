/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:25
*/
/*
 Combined processedModules by KISSY Module Compiler: 

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

