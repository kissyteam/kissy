/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:25
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/progressbar
*/

KISSY.add("editor/plugin/progressbar", ["base"], function(S, require) {
  var Base = require("base");
  return Base.extend({destroy:function() {
    var self = this;
    self.detach();
    self.el.remove()
  }, initializer:function() {
    var self = this, h = self.get("height"), prefixCls = self.get("prefixCls"), el = new Node(S.substitute("<div" + ' class="{prefixCls}editor-progressbar" ' + ' style="width:' + self.get("width") + ";" + "height:" + h + ';"' + "></div>", {prefixCls:prefixCls})), container = self.get("container"), p = (new Node(S.substitute('<div style="overflow:hidden;">' + '<div class="{prefixCls}editor-progressbar-inner" style="height:' + (parseInt(h, 10) - 4) + 'px">' + '<div class="{prefixCls}editor-progressbar-inner-bg"></div>' + 
    "</div>" + "</div>", {prefixCls:prefixCls}))).appendTo(el), title = (new Node('<span class="' + prefixCls + 'editor-progressbar-title"></span>')).appendTo(el);
    if(container) {
      el.appendTo(container)
    }
    self.el = el;
    self._title = title;
    self._p = p;
    self.on("afterProgressChange", self._progressChange, self);
    self._progressChange({newVal:self.get("progress")})
  }, _progressChange:function(ev) {
    var self = this, v = ev.newVal;
    self._p.css("width", v + "%");
    self._title.html(v + "%")
  }}, {ATTRS:{container:{}, width:{}, height:{}, progress:{value:0}, prefixCls:{value:"ks-"}}})
});

