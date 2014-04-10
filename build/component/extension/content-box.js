/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 10 18:35
*/
/*
 Combined modules by KISSY Module Compiler: 

 component/extension/content-box
*/

KISSY.add("component/extension/content-box", ["component/extension/content-xtpl"], function(S, require) {
  var ContentTpl = require("component/extension/content-xtpl");
  function shortcut(self) {
    var contentEl = self.get("contentEl");
    self.$contentEl = self.$contentEl = contentEl;
    self.contentEl = self.contentEl = contentEl[0]
  }
  function ContentBox() {
  }
  ContentBox.prototype = {__createDom:function() {
    shortcut(this)
  }, __decorateDom:function() {
    shortcut(this)
  }, getChildrenContainerEl:function() {
    return this.get("contentEl")
  }, _onSetContent:function(v) {
    var contentEl = this.$contentEl;
    contentEl.html(v);
    if(!this.get("allowTextSelection")) {
      contentEl.unselectable()
    }
  }};
  S.mix(ContentBox, {ATTRS:{contentTpl:{value:ContentTpl}, contentEl:{selector:function() {
    return"." + this.getBaseCssClass("content")
  }}, content:{parse:function() {
    return this.get("contentEl").html()
  }}}});
  return ContentBox
});

