/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:26
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/undo/cmd
*/

KISSY.add("editor/plugin/undo/cmd", ["editor"], function(S, require) {
  var Editor = require("editor");
  var UA = S.UA, LIMIT = 30;
  function Snapshot(editor) {
    var contents = editor.get("document")[0].body.innerHTML, self = this, selection;
    if(contents) {
      selection = editor.getSelection()
    }
    self.contents = contents;
    self.bookmarks = selection && selection.createBookmarks2(true)
  }
  S.augment(Snapshot, {equals:function(otherImage) {
    var self = this, thisContents = self.contents, otherContents = otherImage.contents;
    return thisContents === otherContents
  }});
  function UndoManager(editor) {
    var self = this;
    self.history = [];
    self.index = -1;
    self.editor = editor;
    self.bufferRunner = S.buffer(self.save, 500, self);
    self._init()
  }
  var modifierKeyCodes = {16:1, 17:1, 18:1}, navigationKeyCodes = {37:1, 38:1, 39:1, 40:1, 33:1, 34:1}, zKeyCode = 90, yKeyCode = 89;
  S.augment(UndoManager, {_keyMonitor:function() {
    var self = this, editor = self.editor;
    editor.docReady(function() {
      editor.get("document").on("keydown", function(ev) {
        var keyCode = ev.keyCode;
        if(keyCode in navigationKeyCodes || keyCode in modifierKeyCodes) {
          return
        }
        if(keyCode === zKeyCode && (ev.ctrlKey || ev.metaKey)) {
          if(false !== editor.fire("beforeRedo")) {
            self.restore(-1)
          }
          ev.halt();
          return
        }
        if(keyCode === yKeyCode && (ev.ctrlKey || ev.metaKey)) {
          if(false !== editor.fire("beforeUndo")) {
            self.restore(1)
          }
          ev.halt();
          return
        }
        if(editor.fire("beforeSave", {buffer:1}) !== false) {
          self.save(1)
        }
      })
    })
  }, _init:function() {
    var self = this, editor = self.editor;
    self._keyMonitor();
    setTimeout(function() {
      if(editor.get("mode") === Editor.Mode.WYSIWYG_MODE) {
        if(editor.isDocReady()) {
          self.save()
        }else {
          editor.on("docReady", function docReady() {
            self.save();
            editor.detach("docReady", docReady)
          })
        }
      }
    }, 0)
  }, save:function(buffer) {
    var editor = this.editor;
    if(editor.get("mode") !== Editor.Mode.WYSIWYG_MODE) {
      return
    }
    if(!editor.get("document")) {
      return
    }
    if(buffer) {
      this.bufferRunner();
      return
    }
    var self = this, history = self.history, l = history.length, index = self.index;
    l = Math.min(l, index + 1);
    var last = history[l - 1], current = new Snapshot(editor);
    if(!last || !last.equals(current)) {
      history.length = l;
      if(l === LIMIT) {
        history.shift();
        l--
      }
      history.push(current);
      self.index = index = l;
      editor.fire("afterSave", {history:history, index:index})
    }
  }, restore:function(d) {
    if(this.editor.get("mode") !== Editor.Mode.WYSIWYG_MODE) {
      return undefined
    }
    var self = this, history = self.history, editor = self.editor, editorDomBody = editor.get("document")[0].body, snapshot = history[self.index + d];
    if(snapshot) {
      editorDomBody.innerHTML = snapshot.contents;
      if(snapshot.bookmarks) {
        editor.getSelection().selectBookmarks(snapshot.bookmarks)
      }else {
        if(UA.ie) {
          var $range = editorDomBody.createTextRange();
          $range.collapse(true);
          $range.select()
        }
      }
      var selection = editor.getSelection();
      if(selection) {
        selection.scrollIntoView()
      }
      self.index += d;
      editor.fire(d < 0 ? "afterUndo" : "afterRedo", {history:history, index:self.index});
      editor.notifySelectionChange()
    }
    return snapshot
  }});
  return{init:function(editor) {
    if(!editor.hasCommand("save")) {
      var undoRedo = new UndoManager(editor);
      editor.addCommand("save", {exec:function(_, buffer) {
        editor.focus();
        undoRedo.save(buffer)
      }});
      editor.addCommand("undo", {exec:function() {
        editor.focus();
        undoRedo.restore(-1)
      }});
      editor.addCommand("redo", {exec:function() {
        editor.focus();
        undoRedo.restore(1)
      }})
    }
  }}
});

