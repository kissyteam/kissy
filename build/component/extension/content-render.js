/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:16
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 component/extension/content-render
*/

KISSY.add("component/extension/content-render", ["component/extension/content-xtpl"], function(S, require) {
  var ContentTpl = require("component/extension/content-xtpl");
  function shortcut(self) {
    var control = self.control;
    var contentEl = control.get("contentEl");
    self.$contentEl = control.$contentEl = contentEl;
    self.contentEl = control.contentEl = contentEl[0]
  }
  function ContentRender() {
  }
  ContentRender.prototype = {__beforeCreateDom:function(renderData, childrenElSelectors) {
    S.mix(childrenElSelectors, {contentEl:"#ks-content-{id}"})
  }, __createDom:function() {
    shortcut(this)
  }, __decorateDom:function() {
    shortcut(this)
  }, getChildrenContainerEl:function() {
    return this.control.get("contentEl")
  }, _onSetContent:function(v) {
    var control = this.control, contentEl = control.$contentEl;
    contentEl.html(v);
    if(!control.get("allowTextSelection")) {
      contentEl.unselectable()
    }
  }};
  S.mix(ContentRender, {ATTRS:{contentTpl:{value:ContentTpl}}, HTML_PARSER:{content:function(el) {
    return el.one("." + this.getBaseCssClass("content")).html()
  }, contentEl:function(el) {
    return el.one("." + this.getBaseCssClass("content"))
  }}});
  return ContentRender
});

