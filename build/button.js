/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:15
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 button/render
 button
*/

KISSY.add("button/render", ["component/control"], function(S, require) {
  var Control = require("component/control");
  return Control.getDefaultRender().extend({beforeCreateDom:function(renderData) {
    var self = this;
    S.mix(renderData.elAttrs, {role:"button", title:renderData.tooltip, "aria-describedby":renderData.describedby});
    if(renderData.checked) {
      renderData.elCls.push(self.getBaseCssClasses("checked"))
    }
  }, _onSetChecked:function(v) {
    var self = this, cls = self.getBaseCssClasses("checked");
    self.$el[v ? "addClass" : "removeClass"](cls)
  }, _onSetTooltip:function(title) {
    this.el.setAttribute("title", title)
  }, _onSetDescribedby:function(describedby) {
    this.el.setAttribute("aria-describedby", describedby)
  }}, {name:"ButtonRender"})
});
KISSY.add("button", ["node", "component/control", "button/render"], function(S, require) {
  var Node = require("node"), Control = require("component/control"), ButtonRender = require("button/render");
  var KeyCode = Node.KeyCode;
  return Control.extend({isButton:1, bindUI:function() {
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
  }}, {ATTRS:{value:{}, describedby:{value:"", view:1}, tooltip:{value:"", view:1}, checkable:{}, checked:{value:false, view:1}, xrender:{value:ButtonRender}}, xclass:"button"})
});

