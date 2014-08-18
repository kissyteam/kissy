/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:26
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/undo/btn
*/

KISSY.add("editor/plugin/undo/btn", ["../button", "editor"], function(S, require) {
  var Button = require("../button");
  var Editor = require("editor");
  var UndoBtn = Button.extend({__lock:true, bindUI:function() {
    var self = this, editor = self.get("editor");
    self.on("click", function() {
      editor.execCommand("undo")
    });
    editor.on("afterUndo afterRedo afterSave", function(ev) {
      var index = ev.index;
      if(index > 0) {
        self.set("disabled", self.__lock = false)
      }else {
        self.set("disabled", self.__lock = true)
      }
    })
  }}, {ATTRS:{mode:{value:Editor.Mode.WYSIWYG_MODE}, disabled:{value:true, setter:function(v) {
    if(this.__lock) {
      v = true
    }
    return v
  }}}});
  var RedoBtn = Button.extend({__lock:true, bindUI:function() {
    var self = this, editor = self.get("editor");
    self.on("click", function() {
      editor.execCommand("redo")
    });
    editor.on("afterUndo afterRedo afterSave", function(ev) {
      var history = ev.history, index = ev.index;
      if(index < history.length - 1) {
        self.set("disabled", self.__lock = false)
      }else {
        self.set("disabled", self.__lock = true)
      }
    })
  }}, {ATTRS:{mode:{value:Editor.Mode.WYSIWYG_MODE}, disabled:{value:true, setter:function(v) {
    if(this.__lock) {
      v = true
    }
    return v
  }}}});
  return{RedoBtn:RedoBtn, UndoBtn:UndoBtn}
});

