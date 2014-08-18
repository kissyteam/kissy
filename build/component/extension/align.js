/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:16
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 component/extension/align
*/

KISSY.add("component/extension/align", ["node"], function(S, require) {
  var Node = require("node");
  var win = S.Env.host, $ = Node.all, UA = S.UA;
  function getOffsetParent(element) {
    var doc = element.ownerDocument, body = doc.body, parent, positionStyle = $(element).css("position"), skipStatic = positionStyle === "fixed" || positionStyle === "absolute";
    if(!skipStatic) {
      return element.nodeName.toLowerCase() === "html" ? null : element.parentNode
    }
    for(parent = element.parentNode;parent && parent !== body;parent = parent.parentNode) {
      positionStyle = $(parent).css("position");
      if(positionStyle !== "static") {
        return parent
      }
    }
    return null
  }
  function getVisibleRectForElement(element) {
    var visibleRect = {left:0, right:Infinity, top:0, bottom:Infinity}, el, scrollX, scrollY, winSize, doc = element.ownerDocument, $win = $(doc).getWindow(), body = doc.body, documentElement = doc.documentElement;
    for(el = element;el = getOffsetParent(el);) {
      if((!UA.ie || el.clientWidth !== 0) && el !== body && el !== documentElement && $(el).css("overflow") !== "visible") {
        var pos = $(el).offset();
        pos.left += el.clientLeft;
        pos.top += el.clientTop;
        visibleRect.top = Math.max(visibleRect.top, pos.top);
        visibleRect.right = Math.min(visibleRect.right, pos.left + el.clientWidth);
        visibleRect.bottom = Math.min(visibleRect.bottom, pos.top + el.clientHeight);
        visibleRect.left = Math.max(visibleRect.left, pos.left)
      }
    }
    scrollX = $win.scrollLeft();
    scrollY = $win.scrollTop();
    visibleRect.left = Math.max(visibleRect.left, scrollX);
    visibleRect.top = Math.max(visibleRect.top, scrollY);
    winSize = {width:$win.width(), height:$win.height()};
    visibleRect.right = Math.min(visibleRect.right, scrollX + winSize.width);
    visibleRect.bottom = Math.min(visibleRect.bottom, scrollY + winSize.height);
    return visibleRect.top >= 0 && visibleRect.left >= 0 && visibleRect.bottom > visibleRect.top && visibleRect.right > visibleRect.left ? visibleRect : null
  }
  function getElFuturePos(elRegion, refNodeRegion, points, offset) {
    var xy, diff, p1, p2;
    xy = {left:elRegion.left, top:elRegion.top};
    p1 = getAlignOffset(refNodeRegion, points[0]);
    p2 = getAlignOffset(elRegion, points[1]);
    diff = [p2.left - p1.left, p2.top - p1.top];
    return{left:xy.left - diff[0] + +offset[0], top:xy.top - diff[1] + +offset[1]}
  }
  function isFailX(elFuturePos, elRegion, visibleRect) {
    return elFuturePos.left < visibleRect.left || elFuturePos.left + elRegion.width > visibleRect.right
  }
  function isFailY(elFuturePos, elRegion, visibleRect) {
    return elFuturePos.top < visibleRect.top || elFuturePos.top + elRegion.height > visibleRect.bottom
  }
  function adjustForViewport(elFuturePos, elRegion, visibleRect, overflow) {
    var pos = S.clone(elFuturePos), size = {width:elRegion.width, height:elRegion.height};
    if(overflow.adjustX && pos.left < visibleRect.left) {
      pos.left = visibleRect.left
    }
    if(overflow.resizeWidth && pos.left >= visibleRect.left && pos.left + size.width > visibleRect.right) {
      size.width -= pos.left + size.width - visibleRect.right
    }
    if(overflow.adjustX && pos.left + size.width > visibleRect.right) {
      pos.left = Math.max(visibleRect.right - size.width, visibleRect.left)
    }
    if(overflow.adjustY && pos.top < visibleRect.top) {
      pos.top = visibleRect.top
    }
    if(overflow.resizeHeight && pos.top >= visibleRect.top && pos.top + size.height > visibleRect.bottom) {
      size.height -= pos.top + size.height - visibleRect.bottom
    }
    if(overflow.adjustY && pos.top + size.height > visibleRect.bottom) {
      pos.top = Math.max(visibleRect.bottom - size.height, visibleRect.top)
    }
    return S.mix(pos, size)
  }
  function flip(points, reg, map) {
    var ret = [];
    S.each(points, function(p) {
      ret.push(p.replace(reg, function(m) {
        return map[m]
      }))
    });
    return ret
  }
  function flipOffset(offset, index) {
    offset[index] = -offset[index];
    return offset
  }
  function Align() {
  }
  Align.__getOffsetParent = getOffsetParent;
  Align.__getVisibleRectForElement = getVisibleRectForElement;
  Align.ATTRS = {align:{value:{}}};
  function getRegion(node) {
    var offset, w, h, domNode = node[0];
    if(!S.isWindow(domNode)) {
      offset = node.offset();
      w = node.outerWidth();
      h = node.outerHeight()
    }else {
      var $win = $(domNode).getWindow();
      offset = {left:$win.scrollLeft(), top:$win.scrollTop()};
      w = $win.width();
      h = $win.height()
    }
    offset.width = w;
    offset.height = h;
    return offset
  }
  function getAlignOffset(region, align) {
    var V = align.charAt(0), H = align.charAt(1), w = region.width, h = region.height, x, y;
    x = region.left;
    y = region.top;
    if(V === "c") {
      y += h / 2
    }else {
      if(V === "b") {
        y += h
      }
    }
    if(H === "c") {
      x += w / 2
    }else {
      if(H === "r") {
        x += w
      }
    }
    return{left:x, top:y}
  }
  function beforeVisibleChange(e) {
    if(e.target === this && e.newVal) {
      realign.call(this)
    }
  }
  function onResize() {
    if(this.get("visible")) {
      realign.call(this)
    }
  }
  function realign() {
    this._onSetAlign(this.get("align"))
  }
  Align.prototype = {__bindUI:function() {
    var self = this;
    self.on("beforeVisibleChange", beforeVisibleChange, self);
    self.$el.getWindow().on("resize", onResize, self)
  }, _onSetAlign:function(v) {
    if(v && v.points) {
      this.align(v.node, v.points, v.offset, v.overflow)
    }
  }, align:function(refNode, points, offset, overflow) {
    refNode = Node.one(refNode || win);
    offset = offset && [].concat(offset) || [0, 0];
    overflow = overflow || {};
    var self = this, el = self.$el, fail = 0;
    var visibleRect = getVisibleRectForElement(el[0]);
    var elRegion = getRegion(el);
    var refNodeRegion = getRegion(refNode);
    var elFuturePos = getElFuturePos(elRegion, refNodeRegion, points, offset);
    var newElRegion = S.merge(elRegion, elFuturePos);
    if(visibleRect && (overflow.adjustX || overflow.adjustY)) {
      if(isFailX(elFuturePos, elRegion, visibleRect)) {
        fail = 1;
        points = flip(points, /[lr]/ig, {l:"r", r:"l"});
        offset = flipOffset(offset, 0)
      }
      if(isFailY(elFuturePos, elRegion, visibleRect)) {
        fail = 1;
        points = flip(points, /[tb]/ig, {t:"b", b:"t"});
        offset = flipOffset(offset, 1)
      }
      if(fail) {
        elFuturePos = getElFuturePos(elRegion, refNodeRegion, points, offset);
        S.mix(newElRegion, elFuturePos)
      }
      var newOverflowCfg = {};
      newOverflowCfg.adjustX = overflow.adjustX && isFailX(elFuturePos, elRegion, visibleRect);
      newOverflowCfg.adjustY = overflow.adjustY && isFailY(elFuturePos, elRegion, visibleRect);
      if(newOverflowCfg.adjustX || newOverflowCfg.adjustY) {
        newElRegion = adjustForViewport(elFuturePos, elRegion, visibleRect, newOverflowCfg)
      }
    }
    self.set({x:newElRegion.left, y:newElRegion.top}, {force:1});
    if(newElRegion.width !== elRegion.width) {
      self.set("width", el.width() + newElRegion.width - elRegion.width)
    }
    if(newElRegion.height !== elRegion.height) {
      self.set("height", el.height() + newElRegion.height - elRegion.height)
    }
    return self
  }, center:function(node) {
    var self = this;
    self.set("align", {node:node, points:["cc", "cc"], offset:[0, 0]});
    return self
  }, __destructor:function() {
    var self = this;
    if(self.$el) {
      self.$el.getWindow().detach("resize", onResize, self)
    }
  }};
  return Align
});

