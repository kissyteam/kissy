/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:21
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/flash-common/base-class
*/

KISSY.add("editor/plugin/flash-common/base-class", ["./utils", "base", "editor", "../dialog-loader", "../bubble", "../contextmenu"], function(S, require) {
  var flashUtils = require("./utils");
  var Base = require("base");
  var Editor = require("editor");
  var Node = S.Node;
  var DialogLoader = require("../dialog-loader");
  require("../bubble");
  require("../contextmenu");
  var tipHTML = " <a " + 'class="{prefixCls}editor-bubble-url" ' + 'target="_blank" ' + 'href="#">{label}</a>   |   ' + ' <span class="{prefixCls}editor-bubble-link {prefixCls}editor-bubble-change">\u7f16\u8f91</span>   |   ' + ' <span class="{prefixCls}editor-bubble-link {prefixCls}editor-bubble-remove">\u5220\u9664</span>';
  return Base.extend({initializer:function() {
    var self = this, cls = self.get("cls"), editor = self.get("editor"), prefixCls = editor.get("prefixCls"), children = [], bubbleId = self.get("bubbleId"), contextMenuId = self.get("contextMenuId"), contextMenuHandlers = self.get("contextMenuHandlers");
    S.each(contextMenuHandlers, function(h, content) {
      children.push({content:content})
    });
    editor.addContextMenu(contextMenuId, "." + cls, {width:"120px", children:children, listeners:{click:function(e) {
      var content = e.target.get("content");
      if(contextMenuHandlers[content]) {
        contextMenuHandlers[content].call(this)
      }
    }}});
    editor.addBubble(bubbleId, function(el) {
      return el.hasClass(cls, undefined) && el
    }, {listeners:{afterRenderUI:function() {
      var bubble = this, el = bubble.get("contentEl");
      el.html(S.substitute(tipHTML, {label:self.get("label"), prefixCls:prefixCls}));
      var tipUrlEl = el.one("." + prefixCls + "editor-bubble-url"), tipChangeEl = el.one("." + prefixCls + "editor-bubble-change"), tipRemoveEl = el.one("." + prefixCls + "editor-bubble-remove");
      Editor.Utils.preventFocus(el);
      tipChangeEl.on("click", function(ev) {
        self.show(bubble.get("editorSelectedEl"));
        ev.halt()
      });
      tipRemoveEl.on("click", function(ev) {
        if(S.UA.webkit) {
          var r = editor.getSelection().getRanges(), r0 = r && r[0];
          if(r0) {
            r0.collapse(true);
            r0.select()
          }
        }
        bubble.get("editorSelectedEl").remove();
        bubble.hide();
        editor.notifySelectionChange();
        ev.halt()
      });
      bubble.on("show", function() {
        var a = bubble.get("editorSelectedEl");
        if(a) {
          self._updateTip(tipUrlEl, a)
        }
      })
    }}});
    editor.docReady(function() {
      editor.get("document").on("dblclick", self._dbClick, self)
    })
  }, _getFlashUrl:function(r) {
    return flashUtils.getUrl(r)
  }, _updateTip:function(tipUrlElEl, selectedFlash) {
    var self = this, editor = self.get("editor"), r = editor.restoreRealElement(selectedFlash);
    if(!r) {
      return
    }
    var url = self._getFlashUrl(r);
    tipUrlElEl.attr("href", url)
  }, _dbClick:function(ev) {
    var self = this, t = new Node(ev.target);
    if(t.nodeName() === "img" && t.hasClass(self.get("cls"), undefined)) {
      self.show(t);
      ev.halt()
    }
  }, show:function(selectedEl) {
    var self = this, editor = self.get("editor");
    DialogLoader.useDialog(editor, self.get("type"), self.get("pluginConfig"), selectedEl)
  }}, {ATTRS:{cls:{}, type:{}, label:{value:"\u5728\u65b0\u7a97\u53e3\u67e5\u770b"}, bubbleId:{}, contextMenuId:{}, contextMenuHandlers:{}}})
});

