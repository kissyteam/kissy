/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:19
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/checkbox-source-area
*/

KISSY.add("editor/plugin/checkbox-source-area", ["editor"], function(S, require) {
  var Editor = require("editor");
  var Node = S.Node;
  var SOURCE_MODE = Editor.Mode.SOURCE_MODE, WYSIWYG_MODE = Editor.Mode.WYSIWYG_MODE;
  function CheckboxSourceArea(editor) {
    var self = this;
    self.editor = editor;
    self._init()
  }
  S.augment(CheckboxSourceArea, {_init:function() {
    var self = this, editor = self.editor, statusBarEl = editor.get("statusBarEl");
    self.holder = new Node("<span " + 'style="zoom:1;display:inline-block;height:22px;line-height:22px;">' + '<label style="vertical-align:middle;">' + '<input style="margin:0 5px;" type="checkbox" />' + "\u7f16\u8f91\u6e90\u4ee3\u7801</label>" + "</span>");
    self.holder.appendTo(statusBarEl);
    var el = self.el = self.holder.one("input");
    el.on("click", self._check, self);
    editor.on("wysiwygMode", self._wysiwygmode, self);
    editor.on("sourceMode", self._sourcemode, self)
  }, _sourcemode:function() {
    this.el.attr("checked", true)
  }, _wysiwygmode:function() {
    this.el.attr("checked", false)
  }, _check:function() {
    var self = this, editor = self.editor, el = self.el;
    if(el.attr("checked")) {
      editor.set("mode", SOURCE_MODE)
    }else {
      editor.set("mode", WYSIWYG_MODE)
    }
  }, destroy:function() {
    this.holder.remove()
  }});
  function CheckboxSourceAreaPlugin() {
  }
  S.augment(CheckboxSourceAreaPlugin, {pluginRenderUI:function(editor) {
    var c = new CheckboxSourceArea(editor);
    editor.on("destroy", function() {
      c.destroy()
    })
  }});
  return CheckboxSourceAreaPlugin
});

