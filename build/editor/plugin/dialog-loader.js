/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:20
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/dialog-loader
*/

KISSY.add("editor/plugin/dialog-loader", ["editor", "overlay"], function(S, require) {
  var Editor = require("editor");
  var Overlay = require("overlay");
  var globalMask, loadMask = {loading:function(prefixCls) {
    if(!globalMask) {
      globalMask = new Overlay({x:0, width:S.UA.ie === 6 ? S.DOM.docWidth() : "100%", y:0, zIndex:Editor.baseZIndex(Editor.ZIndexManager.LOADING), prefixCls:prefixCls + "editor-", elCls:prefixCls + "editor-global-loading"})
    }
    globalMask.set("height", S.DOM.docHeight());
    globalMask.show();
    globalMask.loading()
  }, unloading:function() {
    globalMask.hide()
  }};
  return{useDialog:function(editor, name, config, args) {
    editor.focus();
    var prefixCls = editor.get("prefixCls");
    if(editor.getControl(name + "/dialog")) {
      setTimeout(function() {
        editor.showDialog(name, args)
      }, 0);
      return
    }
    loadMask.loading(prefixCls);
    S.use("editor/plugin/" + name + "/dialog", function(S, Dialog) {
      loadMask.unloading();
      editor.addControl(name + "/dialog", new Dialog(editor, config));
      editor.showDialog(name, args)
    })
  }}
});

