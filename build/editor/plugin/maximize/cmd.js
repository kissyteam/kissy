/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:24
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/maximize/cmd
*/

KISSY.add("editor/plugin/maximize/cmd", ["editor", "event"], function(S, require) {
  var Editor = require("editor");
  var Event = require("event");
  var UA = S.UA, ie = UA.ie, doc = document, Node = S.Node, Dom = S.DOM, iframe, MAXIMIZE_TOOLBAR_CLASS = "editor-toolbar-padding", init = function() {
    if(!iframe) {
      iframe = (new Node("<" + "iframe " + ' style="' + "position:absolute;" + "top:-9999px;" + "left:-9999px;" + '"' + ' frameborder="0">')).prependTo(doc.body, undefined)
    }
  };
  function MaximizeCmd(editor) {
    this.editor = editor
  }
  S.augment(MaximizeCmd, {restoreWindow:function() {
    var self = this, editor = self.editor;
    if(editor.fire("beforeRestoreWindow") === false) {
      return
    }
    if(self._resize) {
      Event.remove(window, "resize", self._resize);
      self._resize.stop();
      self._resize = 0
    }else {
      return
    }
    self._saveEditorStatus();
    self._restoreState();
    setTimeout(function() {
      self._restoreEditorStatus();
      editor.notifySelectionChange();
      editor.fire("afterRestoreWindow")
    }, 30)
  }, _restoreState:function() {
    var self = this, editor = self.editor, textareaEl = editor.get("textarea"), _savedParents = self._savedParents;
    if(_savedParents) {
      for(var i = 0;i < _savedParents.length;i++) {
        var po = _savedParents[i];
        po.el.css("position", po.position)
      }
      self._savedParents = null
    }
    textareaEl.parent().css({height:self.iframeHeight});
    textareaEl.css({height:self.iframeHeight});
    Dom.css(doc.body, {width:"", height:"", overflow:""});
    doc.documentElement.style.overflow = "";
    var editorElStyle = editor.get("el")[0].style;
    editorElStyle.position = "static";
    editorElStyle.width = self.editorElWidth;
    iframe.css({left:"-99999px", top:"-99999px"});
    window.scrollTo(self.scrollLeft, self.scrollTop);
    if(ie < 8) {
      editor.get("toolBarEl").removeClass(editor.get("prefixCls") + MAXIMIZE_TOOLBAR_CLASS, undefined)
    }
  }, _saveSate:function() {
    var self = this, editor = self.editor, _savedParents = [], editorEl = editor.get("el");
    self.iframeHeight = editor.get("textarea").parent().style("height");
    self.editorElWidth = editorEl.style("width");
    self.scrollLeft = Dom.scrollLeft();
    self.scrollTop = Dom.scrollTop();
    window.scrollTo(0, 0);
    var p = editorEl.parent();
    while(p) {
      var pre = p.css("position");
      if(pre !== "static") {
        _savedParents.push({el:p, position:pre});
        p.css("position", "static")
      }
      p = p.parent()
    }
    self._savedParents = _savedParents;
    if(ie < 8) {
      editor.get("toolBarEl").addClass(editor.get("prefixCls") + MAXIMIZE_TOOLBAR_CLASS, undefined)
    }
  }, _saveEditorStatus:function() {
    var self = this, editor = self.editor;
    self.savedRanges = null;
    if(!UA.gecko || !editor.__iframeFocus) {
      return
    }
    var sel = editor.getSelection();
    self.savedRanges = sel && sel.getRanges()
  }, _restoreEditorStatus:function() {
    var self = this, editor = self.editor, sel = editor.getSelection(), savedRanges = self.savedRanges;
    if(UA.gecko) {
      editor.activateGecko()
    }
    if(savedRanges && sel) {
      sel.selectRanges(savedRanges)
    }
    if(editor.__iframeFocus && sel) {
      var element = sel.getStartElement();
      if(element) {
        element.scrollIntoView(undefined, {alignWithTop:false, allowHorizontalScroll:true, onlyScrollIfNeeded:true})
      }
    }
  }, _maximize:function(stop) {
    var self = this, editor = self.editor, editorEl = editor.get("el"), viewportHeight = Dom.viewportHeight(), viewportWidth = Dom.viewportWidth(), textareaEl = editor.get("textarea"), statusHeight = editor.get("statusBarEl") ? editor.get("statusBarEl")[0].offsetHeight : 0, toolHeight = editor.get("toolBarEl")[0].offsetHeight;
    if(!ie) {
      Dom.css(doc.body, {width:0, height:0, overflow:"hidden"})
    }else {
      doc.body.style.overflow = "hidden"
    }
    doc.documentElement.style.overflow = "hidden";
    editorEl.css({position:"absolute", zIndex:Editor.baseZIndex(Editor.ZIndexManager.MAXIMIZE), width:viewportWidth + "px"});
    iframe.css({zIndex:Editor.baseZIndex(Editor.ZIndexManager.MAXIMIZE - 5), height:viewportHeight + "px", width:viewportWidth + "px"});
    editorEl.offset({left:0, top:0});
    iframe.css({left:0, top:0});
    textareaEl.parent().css({height:viewportHeight - statusHeight - toolHeight + "px"});
    textareaEl.css({height:viewportHeight - statusHeight - toolHeight + "px"});
    if(stop !== true) {
      arguments.callee.call(self, true)
    }
  }, _real:function() {
    var self = this, editor = self.editor;
    if(self._resize) {
      return
    }
    self._saveEditorStatus();
    self._saveSate();
    self._maximize();
    if(!self._resize) {
      self._resize = S.buffer(function() {
        self._maximize();
        editor.fire("afterMaximizeWindow")
      }, 100)
    }
    Event.on(window, "resize", self._resize);
    setTimeout(function() {
      self._restoreEditorStatus();
      editor.notifySelectionChange();
      editor.fire("afterMaximizeWindow")
    }, 30)
  }, maximizeWindow:function() {
    var self = this, editor = self.editor;
    if(editor.fire("beforeMaximizeWindow") === false) {
      return
    }
    init();
    self._real()
  }, destroy:function() {
    var self = this;
    if(self._resize) {
      Event.remove(window, "resize", self._resize);
      self._resize.stop();
      self._resize = 0
    }
  }});
  return{init:function(editor) {
    if(!editor.hasCommand("maximizeWindow")) {
      var maximizeCmd = new MaximizeCmd(editor);
      editor.addCommand("maximizeWindow", {exec:function() {
        maximizeCmd.maximizeWindow()
      }});
      editor.addCommand("restoreWindow", {exec:function() {
        maximizeCmd.restoreWindow()
      }})
    }
  }}
});

