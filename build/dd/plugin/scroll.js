/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:18
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 dd/plugin/scroll
*/

KISSY.add("dd/plugin/scroll", ["node", "dd", "base"], function(S, require) {
  var Node = require("node"), DD = require("dd"), Base = require("base");
  var DDM = DD.DDM, win = S.Env.host, SCROLL_EVENT = ".-ks-dd-scroll" + S.now(), RATE = [10, 10], ADJUST_DELAY = 100, DIFF = [20, 20], isWin = S.isWindow;
  return Base.extend({pluginId:"dd/plugin/scroll", getRegion:function(node) {
    if(isWin(node[0])) {
      return{width:node.width(), height:node.height()}
    }else {
      return{width:node.outerWidth(), height:node.outerHeight()}
    }
  }, getOffset:function(node) {
    if(isWin(node[0])) {
      return{left:node.scrollLeft(), top:node.scrollTop()}
    }else {
      return node.offset()
    }
  }, getScroll:function(node) {
    return{left:node.scrollLeft(), top:node.scrollTop()}
  }, setScroll:function(node, r) {
    node.scrollLeft(r.left);
    node.scrollTop(r.top)
  }, pluginDestructor:function(drag) {
    drag.detach(SCROLL_EVENT)
  }, pluginInitializer:function(drag) {
    var self = this, node = self.get("node");
    var rate = self.get("rate"), diff = self.get("diff"), event, dxy, timer = null;
    function checkContainer() {
      if(isWin(node[0])) {
        return 0
      }
      var mousePos = drag.mousePos, r = DDM.region(node);
      if(!DDM.inRegion(r, mousePos)) {
        clearTimeout(timer);
        timer = 0;
        return 1
      }
      return 0
    }
    function dragging(ev) {
      if(ev.fake) {
        return
      }
      if(checkContainer()) {
        return
      }
      event = ev;
      dxy = S.clone(drag.mousePos);
      var offset = self.getOffset(node);
      dxy.left -= offset.left;
      dxy.top -= offset.top;
      if(!timer) {
        checkAndScroll()
      }
    }
    function dragEnd() {
      clearTimeout(timer);
      timer = null
    }
    drag.on("drag" + SCROLL_EVENT, dragging);
    drag.on("dragstart" + SCROLL_EVENT, function() {
      DDM.cacheWH(node)
    });
    drag.on("dragend" + SCROLL_EVENT, dragEnd);
    function checkAndScroll() {
      if(checkContainer()) {
        return
      }
      var r = self.getRegion(node), nw = r.width, nh = r.height, scroll = self.getScroll(node), origin = S.clone(scroll), diffY = dxy.top - nh, adjust = false;
      if(diffY >= -diff[1]) {
        scroll.top += rate[1];
        adjust = true
      }
      var diffY2 = dxy.top;
      if(diffY2 <= diff[1]) {
        scroll.top -= rate[1];
        adjust = true
      }
      var diffX = dxy.left - nw;
      if(diffX >= -diff[0]) {
        scroll.left += rate[0];
        adjust = true
      }
      var diffX2 = dxy.left;
      if(diffX2 <= diff[0]) {
        scroll.left -= rate[0];
        adjust = true
      }
      if(adjust) {
        self.setScroll(node, scroll);
        timer = setTimeout(checkAndScroll, ADJUST_DELAY);
        event.fake = true;
        if(isWin(node[0])) {
          scroll = self.getScroll(node);
          event.left += scroll.left - origin.left;
          event.top += scroll.top - origin.top
        }
        if(drag.get("move")) {
          drag.get("node").offset(event)
        }
        drag.fire("drag", event)
      }else {
        timer = null
      }
    }
  }}, {ATTRS:{node:{valueFn:function() {
    return Node.one(win)
  }, setter:function(v) {
    return Node.one(v)
  }}, rate:{value:RATE}, diff:{value:DIFF}}})
});

