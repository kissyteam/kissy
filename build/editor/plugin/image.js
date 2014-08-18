/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:22
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/image
*/

KISSY.add("editor/plugin/image", ["./button", "editor", "./bubble", "./dialog-loader", "./contextmenu"], function(S, require) {
  require("./button");
  var Editor = require("editor");
  require("./bubble");
  var DialogLoader = require("./dialog-loader");
  require("./contextmenu");
  var UA = S.UA, Node = KISSY.NodeList, $ = S.all, checkImg = function(node) {
    node = $(node);
    if(node.nodeName() === "img" && !/(^|\s+)ke_/.test(node[0].className)) {
      return node
    }
  }, tipHTML = '<a class="{prefixCls}editor-bubble-url" ' + 'target="_blank" href="#">\u5728\u65b0\u7a97\u53e3\u67e5\u770b</a>  |  ' + '<a class="{prefixCls}editor-bubble-link ' + '{prefixCls}editor-bubble-change" href="#">\u7f16\u8f91</a>  |  ' + '<a class="{prefixCls}editor-bubble-link ' + '{prefixCls}editor-bubble-remove" href="#">\u5220\u9664</a>';
  function ImagePlugin(config) {
    this.config = config || {}
  }
  S.augment(ImagePlugin, {pluginRenderUI:function(editor) {
    var self = this;
    var prefixCls = editor.get("prefixCls");
    function showImageEditor(selectedEl) {
      DialogLoader.useDialog(editor, "image", self.config, selectedEl)
    }
    editor.addButton("image", {tooltip:"\u63d2\u5165\u56fe\u7247", listeners:{click:function() {
      showImageEditor(null)
    }}, mode:Editor.Mode.WYSIWYG_MODE});
    var handlers = [{content:"\u56fe\u7247\u5c5e\u6027", fn:function() {
      var img = checkImg(this.get("editorSelectedEl"));
      if(img) {
        this.hide();
        showImageEditor($(img))
      }
    }}, {content:"\u63d2\u5165\u65b0\u884c", fn:function() {
      this.hide();
      var doc = editor.get("document")[0], p = new Node(doc.createElement("p"));
      if(!UA.ie) {
        p._4eAppendBogus(undefined)
      }
      var r = new Editor.Range(doc);
      r.setStartAfter(this.get("editorSelectedEl"));
      r.select();
      editor.insertElement(p);
      r.moveToElementEditablePosition(p, 1);
      r.select()
    }}];
    var children = [];
    S.each(handlers, function(h) {
      children.push({content:h.content})
    });
    editor.addContextMenu("image", checkImg, {width:120, children:children, listeners:{click:function(e) {
      var self = this, content = e.target.get("content");
      S.each(handlers, function(h) {
        if(h.content === content) {
          h.fn.call(self)
        }
      })
    }}});
    editor.docReady(function() {
      editor.get("document").on("dblclick", function(ev) {
        ev.halt();
        var t = $(ev.target);
        if(checkImg(t)) {
          showImageEditor(t)
        }
      })
    });
    editor.addBubble("image", checkImg, {listeners:{afterRenderUI:function() {
      var bubble = this, el = bubble.get("contentEl");
      el.html(S.substitute(tipHTML, {prefixCls:prefixCls}));
      var tipUrlEl = el.one("." + prefixCls + "editor-bubble-url"), tipChangeEl = el.one("." + prefixCls + "editor-bubble-change"), tipRemoveEl = el.one("." + prefixCls + "editor-bubble-remove");
      Editor.Utils.preventFocus(el);
      tipChangeEl.on("click", function(ev) {
        showImageEditor(bubble.get("editorSelectedEl"));
        ev.halt()
      });
      tipRemoveEl.on("click", function(ev) {
        if(UA.webkit) {
          var r = editor.getSelection().getRanges();
          if(r && r[0]) {
            r[0].collapse();
            r[0].select()
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
          var src = a.attr("_ke_saved_src") || a.attr("src");
          tipUrlEl.attr("href", src)
        }
      })
    }}})
  }});
  return ImagePlugin
});

