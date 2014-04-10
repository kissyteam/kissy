/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 10 18:34
*/
/*
 Combined modules by KISSY Module Compiler: 

 button
*/

KISSY.add("button", ["node", "component/control"], function(S, require) {
  var Node = require("node"), Control = require("component/control");
  var KeyCode = Node.KeyCode;
  return Control.extend({isButton:1, beforeCreateDom:function(renderData) {
    var self = this;
    S.mix(renderData.elAttrs, {role:"button", title:renderData.tooltip, "aria-describedby":renderData.describedby});
    if(renderData.checked) {
      renderData.elCls.push(self.getBaseCssClasses("checked"))
    }
  }, bindUI:function() {
    this.$el.on("keyup", this.handleKeyDownInternal, this)
  }, handleKeyDownInternal:function(e) {
    if(e.keyCode === KeyCode.ENTER && e.type === "keydown" || e.keyCode === KeyCode.SPACE && e.type === "keyup") {
      return this.handleClickInternal(e)
    }
    return e.keyCode === KeyCode.SPACE
  }, handleClickInternal:function() {
    var self = this;
    self.callSuper();
    if(self.get("checkable")) {
      self.set("checked", !self.get("checked"))
    }
    self.fire("click")
  }, _onSetChecked:function(v) {
    var self = this, cls = self.getBaseCssClasses("checked");
    self.$el[v ? "addClass" : "removeClass"](cls)
  }, _onSetTooltip:function(title) {
    this.el.setAttribute("title", title)
  }, _onSetDescribedby:function(describedby) {
    this.el.setAttribute("aria-describedby", describedby)
  }}, {ATTRS:{value:{}, describedby:{value:"", render:1, sync:0}, tooltip:{value:"", render:1, sync:0}, checkable:{}, checked:{value:false, render:1, sync:0}}, xclass:"button"})
});

