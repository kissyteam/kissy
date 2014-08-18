/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:18
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 dd/plugin/constrain
*/

KISSY.add("dd/plugin/constrain", ["node", "base"], function(S, require, exports, module) {
  var Node = require("node"), Base = require("base");
  var $ = Node.all, CONSTRAIN_EVENT = ".-ks-constrain" + S.now(), WIN = S.Env.host;
  function onDragStart(e) {
    var self = this, drag = e.drag, l, t, lt, dragNode = drag.get("dragNode"), constrain = self.get("constrain");
    if(constrain) {
      if(S.isWindow(constrain[0])) {
        self.__constrainRegion = {left:l = constrain.scrollLeft(), top:t = constrain.scrollTop(), right:l + constrain.width(), bottom:t + constrain.height()}
      }else {
        if(constrain.getDOMNode) {
          lt = constrain.offset();
          self.__constrainRegion = {left:lt.left, top:lt.top, right:lt.left + constrain.outerWidth(), bottom:lt.top + constrain.outerHeight()}
        }else {
          if(S.isPlainObject(constrain)) {
            self.__constrainRegion = constrain
          }
        }
      }
      if(self.__constrainRegion) {
        self.__constrainRegion.right -= dragNode.outerWidth();
        self.__constrainRegion.bottom -= dragNode.outerHeight()
      }
    }
  }
  function onDragAlign(e) {
    var self = this, info = {}, l = e.left, t = e.top, constrain = self.__constrainRegion;
    if(constrain) {
      info.left = Math.min(Math.max(constrain.left, l), constrain.right);
      info.top = Math.min(Math.max(constrain.top, t), constrain.bottom);
      e.drag.setInternal("actualPos", info)
    }
  }
  function onDragEnd() {
    this.__constrainRegion = null
  }
  module.exports = Base.extend({pluginId:"dd/plugin/constrain", __constrainRegion:null, pluginInitializer:function(drag) {
    var self = this;
    drag.on("dragstart" + CONSTRAIN_EVENT, onDragStart, self).on("dragend" + CONSTRAIN_EVENT, onDragEnd, self).on("dragalign" + CONSTRAIN_EVENT, onDragAlign, self)
  }, pluginDestructor:function(drag) {
    drag.detach(CONSTRAIN_EVENT, {context:this})
  }}, {ATTRS:{constrain:{value:$(WIN), setter:function(v) {
    if(v) {
      if(v === true) {
        return $(WIN)
      }else {
        if(v.nodeType || S.isWindow(v) || typeof v === "string") {
          return $(v)
        }
      }
    }
    return v
  }}}})
});

