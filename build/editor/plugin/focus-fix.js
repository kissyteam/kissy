/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:21
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/focus-fix
*/

KISSY.add("editor/plugin/focus-fix", ["editor"], function(S, require) {
  var Editor = require("editor");
  var UA = S.UA, focusManager = Editor.focusManager;
  function _show4FocusExt() {
    var self = this;
    self._focusEditor = focusManager.currentInstance();
    var editor = self._focusEditor;
    if(UA.ie && editor) {
      window.focus();
      document.body.focus();
      var $selection = editor.get("document")[0].selection, $range;
      try {
        $range = $selection.createRange()
      }catch(e) {
        $range = 0
      }
      if($range) {
        if($range.item && $range.item(0).ownerDocument === editor.get("document")[0]) {
          var $myRange = document.body.createTextRange();
          $myRange.moveToElementText(self.get("el").first()[0]);
          $myRange.collapse(true);
          $myRange.select()
        }
      }
    }
  }
  function _hide4FocusExt() {
    var self = this, editor = self._focusEditor;
    if(editor) {
      editor.focus()
    }
  }
  return{init:function(self) {
    self.on("beforeVisibleChange", function(e) {
      if(e.newVal) {
        _show4FocusExt.call(self)
      }
    });
    self.on("hide", function() {
      _hide4FocusExt.call(self)
    })
  }}
});

