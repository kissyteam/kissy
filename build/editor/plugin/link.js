/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:23
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/link
*/

KISSY.add("editor/plugin/link", ["./button", "./bubble", "editor", "./link/utils", "./dialog-loader"], function(S, require) {
  require("./button");
  require("./bubble");
  var Editor = require("editor");
  var Utils = require("./link/utils");
  var DialogLoader = require("./dialog-loader");
  var $ = S.all, tipHTML = "<a " + 'href="" ' + ' target="_blank" ' + 'class="{prefixCls}editor-bubble-url">' + "\u5728\u65b0\u7a97\u53e3\u67e5\u770b" + "</a>  \u2013  " + " <span " + 'class="{prefixCls}editor-bubble-link {prefixCls}editor-bubble-change">' + "\u7f16\u8f91" + "</span>   |   " + " <span " + 'class="{prefixCls}editor-bubble-link {prefixCls}editor-bubble-remove">' + "\u53bb\u9664" + "</span>";
  function checkLink(lastElement) {
    lastElement = $(lastElement);
    return lastElement.closest("a", undefined)
  }
  function LinkPlugin(config) {
    this.config = config || {}
  }
  S.augment(LinkPlugin, {pluginRenderUI:function(editor) {
    var prefixCls = editor.get("prefixCls");
    editor.addButton("link", {tooltip:"\u63d2\u5165\u94fe\u63a5", listeners:{click:function() {
      showLinkEditDialog()
    }}, mode:Editor.Mode.WYSIWYG_MODE});
    var self = this;
    function showLinkEditDialog(selectedEl) {
      DialogLoader.useDialog(editor, "link", self.config, selectedEl)
    }
    editor.addBubble("link", checkLink, {listeners:{afterRenderUI:function() {
      var bubble = this, el = bubble.get("contentEl");
      el.html(S.substitute(tipHTML, {prefixCls:prefixCls}));
      var tipUrl = el.one("." + prefixCls + "editor-bubble-url"), tipChange = el.one("." + prefixCls + "editor-bubble-change"), tipRemove = el.one("." + prefixCls + "editor-bubble-remove");
      Editor.Utils.preventFocus(el);
      tipChange.on("click", function(ev) {
        showLinkEditDialog(bubble.get("editorSelectedEl"));
        ev.halt()
      });
      tipRemove.on("click", function(ev) {
        Utils.removeLink(editor, bubble.get("editorSelectedEl"));
        ev.halt()
      });
      bubble.on("show", function() {
        var a = bubble.get("editorSelectedEl");
        if(!a) {
          return
        }
        var href = a.attr(Utils.savedHref) || a.attr("href");
        tipUrl.html(href);
        tipUrl.attr("href", href)
      })
    }}})
  }});
  return LinkPlugin
});

