/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:18
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 dd/ddm
 dd/draggable
 dd/draggable-delegate
 dd/droppable
 dd/droppable-delegate
 dd
*/

KISSY.add("dd/ddm", ["node", "base"], function(S, require) {
  var Node = require("node"), Base = require("base");
  var logger = S.getLogger("dd/ddm");
  var UA = S.UA, $ = Node.all, win = S.Env.host, doc = win.document, $doc = $(doc), $win = $(win), ie6 = UA.ie === 6, PIXEL_THRESH = 3, BUFFER_TIME = 1, MOVE_DELAY = 30, SHIM_Z_INDEX = 999999;
  var Gesture = Node.Gesture, DRAG_MOVE_EVENT = Gesture.move, DRAG_END_EVENT = Gesture.end;
  var DDM = Base.extend({__activeToDrag:0, _regDrop:function(d) {
    this.get("drops").push(d)
  }, _unRegDrop:function(d) {
    var self = this, drops = self.get("drops"), index = S.indexOf(d, drops);
    if(index !== -1) {
      drops.splice(index, 1)
    }
  }, _regToDrag:function(drag) {
    var self = this;
    self.__activeToDrag = drag;
    registerEvent(self)
  }, _start:function() {
    var self = this, drag = self.__activeToDrag;
    if(!drag) {
      return
    }
    self.setInternal("activeDrag", drag);
    self.__activeToDrag = 0;
    if(drag.get("shim")) {
      activeShim(self)
    }
    self.__needDropCheck = 0;
    if(drag.get("groups")) {
      _activeDrops(self);
      if(self.get("validDrops").length) {
        cacheWH(drag.get("node"));
        self.__needDropCheck = 1
      }
    }
  }, _addValidDrop:function(drop) {
    this.get("validDrops").push(drop)
  }, _end:function(e) {
    var self = this, __activeToDrag = self.__activeToDrag, activeDrag = self.get("activeDrag"), activeDrop = self.get("activeDrop");
    if(e) {
      if(__activeToDrag) {
        __activeToDrag._move(e)
      }
      if(activeDrag) {
        activeDrag._move(e)
      }
    }
    unRegisterEvent(self);
    if(__activeToDrag) {
      __activeToDrag._end(e);
      self.__activeToDrag = 0
    }
    if(self._shim) {
      self._shim.hide()
    }
    if(!activeDrag) {
      return
    }
    activeDrag._end(e);
    _deActiveDrops(self);
    if(activeDrop) {
      activeDrop._end(e)
    }
    self.setInternal("activeDrag", null);
    self.setInternal("activeDrop", null)
  }}, {ATTRS:{dragCursor:{value:"move"}, clickPixelThresh:{value:PIXEL_THRESH}, bufferTime:{value:BUFFER_TIME}, activeDrag:{}, activeDrop:{}, drops:{value:[]}, validDrops:{value:[]}}});
  function move(ev) {
    var self = this, drag, __activeToDrag, activeDrag;
    if(ev.touches && ev.touches.length > 1) {
      ddm._end();
      return
    }
    if(__activeToDrag = self.__activeToDrag) {
      __activeToDrag._move(ev)
    }else {
      if(activeDrag = self.get("activeDrag")) {
        activeDrag._move(ev);
        if(self.__needDropCheck) {
          notifyDropsMove(self, ev, activeDrag)
        }
      }
    }
    drag = __activeToDrag || activeDrag;
    if(drag && drag.get("preventDefaultOnMove")) {
      ev.preventDefault()
    }
  }
  var throttleMove = UA.ie ? S.throttle(move, MOVE_DELAY) : move;
  function notifyDropsMove(self, ev, activeDrag) {
    var drops = self.get("validDrops"), mode = activeDrag.get("mode"), activeDrop = 0, oldDrop, vArea = 0, dragRegion = region(activeDrag.get("node")), dragArea = area(dragRegion);
    S.each(drops, function(drop) {
      if(drop.get("disabled")) {
        return undefined
      }
      var a, node = drop.getNodeFromTarget(ev, activeDrag.get("dragNode")[0], activeDrag.get("node")[0]);
      if(!node) {
        return undefined
      }
      if(mode === "point") {
        if(inNodeByPointer(node, activeDrag.mousePos)) {
          a = area(region(node));
          if(!activeDrop) {
            activeDrop = drop;
            vArea = a
          }else {
            if(a < vArea) {
              activeDrop = drop;
              vArea = a
            }
          }
        }
      }else {
        if(mode === "intersect") {
          a = area(intersect(dragRegion, region(node)));
          if(a > vArea) {
            vArea = a;
            activeDrop = drop
          }
        }else {
          if(mode === "strict") {
            a = area(intersect(dragRegion, region(node)));
            if(a === dragArea) {
              activeDrop = drop;
              return false
            }
          }
        }
      }
      return undefined
    });
    oldDrop = self.get("activeDrop");
    if(oldDrop && oldDrop !== activeDrop) {
      oldDrop._handleOut(ev);
      activeDrag._handleOut(ev)
    }
    self.setInternal("activeDrop", activeDrop);
    if(activeDrop) {
      if(oldDrop !== activeDrop) {
        activeDrop._handleEnter(ev)
      }else {
        activeDrop._handleOver(ev)
      }
    }
  }
  var activeShim = function(self) {
    self._shim = $("<div " + 'style="' + "background-color:red;" + "position:" + (ie6 ? "absolute" : "fixed") + ";" + "left:0;" + "width:100%;" + "height:100%;" + "top:0;" + "cursor:" + ddm.get("dragCursor") + ";" + "z-index:" + SHIM_Z_INDEX + ";" + '"><' + "/div>").prependTo(doc.body || doc.documentElement).css("opacity", 0);
    activeShim = showShim;
    if(ie6) {
      $win.on("resize scroll", adjustShimSize, self)
    }
    showShim(self)
  };
  var adjustShimSize = S.throttle(function() {
    var self = this, activeDrag;
    if((activeDrag = self.get("activeDrag")) && activeDrag.get("shim")) {
      self._shim.css({width:$doc.width(), height:$doc.height()})
    }
  }, MOVE_DELAY);
  function showShim(self) {
    var ah = self.get("activeDrag").get("activeHandler"), cur = "auto";
    if(ah) {
      cur = ah.css("cursor")
    }
    if(cur === "auto") {
      cur = self.get("dragCursor")
    }
    self._shim.css({cursor:cur, display:"block"});
    if(ie6) {
      adjustShimSize.call(self)
    }
  }
  function registerEvent(self) {
    $doc.on(DRAG_END_EVENT, self._end, self);
    $doc.on(DRAG_MOVE_EVENT, throttleMove, self);
    if(doc.body.setCapture) {
      doc.body.setCapture()
    }
  }
  function unRegisterEvent(self) {
    $doc.detach(DRAG_MOVE_EVENT, throttleMove, self);
    $doc.detach(DRAG_END_EVENT, self._end, self);
    if(doc.body.releaseCapture) {
      doc.body.releaseCapture()
    }
  }
  function _activeDrops(self) {
    var drops = self.get("drops");
    self.setInternal("validDrops", []);
    if(drops.length) {
      S.each(drops, function(d) {
        d._active()
      })
    }
  }
  function _deActiveDrops(self) {
    var drops = self.get("drops");
    self.setInternal("validDrops", []);
    if(drops.length) {
      S.each(drops, function(d) {
        d._deActive()
      })
    }
  }
  function region(node) {
    var offset = node.offset();
    if(!node.__ddCachedWidth) {
      logger.debug("no cache in dd!");
      logger.debug(node[0])
    }
    return{left:offset.left, right:offset.left + (node.__ddCachedWidth || node.outerWidth()), top:offset.top, bottom:offset.top + (node.__ddCachedHeight || node.outerHeight())}
  }
  function inRegion(region, pointer) {
    return region.left <= pointer.left && region.right >= pointer.left && region.top <= pointer.top && region.bottom >= pointer.top
  }
  function area(region) {
    if(region.top >= region.bottom || region.left >= region.right) {
      return 0
    }
    return(region.right - region.left) * (region.bottom - region.top)
  }
  function intersect(r1, r2) {
    var t = Math.max(r1.top, r2.top), r = Math.min(r1.right, r2.right), b = Math.min(r1.bottom, r2.bottom), l = Math.max(r1.left, r2.left);
    return{left:l, right:r, top:t, bottom:b}
  }
  function inNodeByPointer(node, point) {
    return inRegion(region(node), point)
  }
  function cacheWH(node) {
    if(node) {
      node.__ddCachedWidth = node.outerWidth();
      node.__ddCachedHeight = node.outerHeight()
    }
  }
  var ddm = new DDM;
  ddm.inRegion = inRegion;
  ddm.region = region;
  ddm.area = area;
  ddm.cacheWH = cacheWH;
  ddm.PREFIX_CLS = "ks-dd-";
  return ddm
});
KISSY.add("dd/draggable", ["node", "./ddm", "base"], function(S, require) {
  var Node = require("node"), DDM = require("./ddm"), Base = require("base");
  var UA = S.UA, $ = Node.all, each = S.each, Features = S.Features, ie = UA.ie, NULL = null, PREFIX_CLS = DDM.PREFIX_CLS, doc = S.Env.host.document;
  var Draggable = Base.extend({initializer:function() {
    var self = this;
    self.addTarget(DDM);
    self._allowMove = self.get("move")
  }, _onSetNode:function(n) {
    var self = this;
    self.setInternal("dragNode", n);
    self.bindDragEvent()
  }, bindDragEvent:function() {
    var self = this, node = self.get("node");
    node.on(Node.Gesture.start, handlePreDragStart, self).on("dragstart", self._fixDragStart)
  }, detachDragEvent:function(self) {
    self = this;
    var node = self.get("node");
    node.detach(Node.Gesture.start, handlePreDragStart, self).detach("dragstart", self._fixDragStart)
  }, _bufferTimer:NULL, _onSetDisabledChange:function(d) {
    this.get("dragNode")[d ? "addClass" : "removeClass"](PREFIX_CLS + "-disabled")
  }, _fixDragStart:fixDragStart, _checkHandler:function(t) {
    var self = this, handlers = self.get("handlers"), ret = 0;
    each(handlers, function(handler) {
      if(handler[0] === t || handler.contains(t)) {
        ret = 1;
        self.setInternal("activeHandler", handler);
        return false
      }
      return undefined
    });
    return ret
  }, _checkDragStartValid:function(ev) {
    var self = this;
    if(self.get("primaryButtonOnly") && ev.which !== 1 || self.get("disabled")) {
      return 0
    }
    return 1
  }, _prepare:function(ev) {
    if(!ev) {
      return
    }
    var self = this;
    if(ie) {
      fixIEMouseDown()
    }
    if(self.get("halt")) {
      ev.stopPropagation()
    }
    if(!Features.isTouchEventSupported()) {
      ev.preventDefault()
    }
    var mx = ev.pageX, my = ev.pageY;
    self.setInternal("startMousePos", self.mousePos = {left:mx, top:my});
    if(self._allowMove) {
      var node = self.get("node"), nxy = node.offset();
      self.setInternal("startNodePos", nxy);
      self.setInternal("deltaPos", {left:mx - nxy.left, top:my - nxy.top})
    }
    DDM._regToDrag(self);
    var bufferTime = self.get("bufferTime");
    if(bufferTime) {
      self._bufferTimer = setTimeout(function() {
        self._start(ev)
      }, bufferTime * 1E3)
    }
  }, _clearBufferTimer:function() {
    var self = this;
    if(self._bufferTimer) {
      clearTimeout(self._bufferTimer);
      self._bufferTimer = 0
    }
  }, _move:function(ev) {
    var self = this, pageX = ev.pageX, pageY = ev.pageY;
    if(!self.get("dragging")) {
      var startMousePos = self.get("startMousePos"), start = 0, clickPixelThresh = self.get("clickPixelThresh");
      if(Math.abs(pageX - startMousePos.left) >= clickPixelThresh || Math.abs(pageY - startMousePos.top) >= clickPixelThresh) {
        self._start(ev);
        start = 1
      }
      if(!start) {
        return
      }
    }
    self.mousePos = {left:pageX, top:pageY};
    var customEvent = {drag:self, left:pageX, top:pageY, pageX:pageX, pageY:pageY, domEvent:ev};
    var move = self._allowMove;
    if(move) {
      var diff = self.get("deltaPos"), left = pageX - diff.left, top = pageY - diff.top;
      customEvent.left = left;
      customEvent.top = top;
      self.setInternal("actualPos", {left:left, top:top});
      self.fire("dragalign", customEvent)
    }
    var def = 1;
    if(self.fire("drag", customEvent) === false) {
      def = 0
    }
    if(def && move) {
      self.get("node").offset(self.get("actualPos"))
    }
  }, stopDrag:function() {
    DDM._end()
  }, _end:function(e) {
    e = e || {};
    var self = this, activeDrop;
    self._clearBufferTimer();
    if(ie) {
      fixIEMouseUp()
    }
    if(self.get("dragging")) {
      self.get("node").removeClass(PREFIX_CLS + "drag-over");
      if(activeDrop = DDM.get("activeDrop")) {
        self.fire("dragdrophit", {drag:self, drop:activeDrop})
      }else {
        self.fire("dragdropmiss", {drag:self})
      }
      self.setInternal("dragging", 0);
      self.fire("dragend", {drag:self, pageX:e.pageX, pageY:e.pageY})
    }
  }, _handleOut:function() {
    var self = this;
    self.get("node").removeClass(PREFIX_CLS + "drag-over");
    self.fire("dragexit", {drag:self, drop:DDM.get("activeDrop")})
  }, _handleEnter:function(e) {
    var self = this;
    self.get("node").addClass(PREFIX_CLS + "drag-over");
    self.fire("dragenter", e)
  }, _handleOver:function(e) {
    this.fire("dragover", e)
  }, _start:function(ev) {
    var self = this;
    self._clearBufferTimer();
    self.setInternal("dragging", 1);
    self.setInternal("dragStartMousePos", {left:ev.pageX, top:ev.pageY});
    DDM._start();
    self.fire("dragstart", {drag:self, pageX:ev.pageX, pageY:ev.pageY})
  }, destructor:function() {
    var self = this;
    self.detachDragEvent();
    self.detach()
  }}, {name:"Draggable", ATTRS:{node:{setter:function(v) {
    if(!(v instanceof Node)) {
      return $(v)
    }
    return undefined
  }}, clickPixelThresh:{valueFn:function() {
    return DDM.get("clickPixelThresh")
  }}, bufferTime:{valueFn:function() {
    return DDM.get("bufferTime")
  }}, dragNode:{}, shim:{value:false}, handlers:{value:[], getter:function(vs) {
    var self = this;
    if(!vs.length) {
      vs[0] = self.get("node")
    }
    each(vs, function(v, i) {
      if(typeof v === "function") {
        v = v.call(self)
      }
      if(typeof v === "string") {
        v = self.get("node").one(v)
      }
      if(v.nodeType) {
        v = $(v)
      }
      vs[i] = v
    });
    self.setInternal("handlers", vs);
    return vs
  }}, activeHandler:{}, dragging:{value:false, setter:function(d) {
    var self = this;
    self.get("dragNode")[d ? "addClass" : "removeClass"](PREFIX_CLS + "dragging")
  }}, mode:{value:"point"}, disabled:{value:false}, move:{value:false}, primaryButtonOnly:{value:true}, halt:{value:true}, groups:{value:true}, startMousePos:{}, dragStartMousePos:{}, startNodePos:{}, deltaPos:{}, actualPos:{}, preventDefaultOnMove:{value:true}}, inheritedStatics:{DropMode:{POINT:"point", INTERSECT:"intersect", STRICT:"strict"}}});
  var _ieSelectBack;
  function fixIEMouseUp() {
    doc.body.onselectstart = _ieSelectBack
  }
  function fixIEMouseDown() {
    _ieSelectBack = doc.body.onselectstart;
    doc.body.onselectstart = fixIESelect
  }
  function fixDragStart(e) {
    e.preventDefault()
  }
  function fixIESelect() {
    return false
  }
  var handlePreDragStart = function(ev) {
    var self = this, t = ev.target;
    if(self._checkDragStartValid(ev)) {
      if(!self._checkHandler(t)) {
        return
      }
      self._prepare(ev)
    }
  };
  return Draggable
});
KISSY.add("dd/draggable-delegate", ["node", "./ddm", "./draggable"], function(S, require) {
  var Node = require("node"), DDM = require("./ddm"), Draggable = require("./draggable");
  var PREFIX_CLS = DDM.PREFIX_CLS, $ = Node.all;
  var handlePreDragStart = function(ev) {
    var self = this, handler, node;
    if(!self._checkDragStartValid(ev)) {
      return
    }
    var handlers = self.get("handlers"), target = $(ev.target);
    if(handlers.length) {
      handler = self._getHandler(target)
    }else {
      handler = target
    }
    if(handler) {
      node = self._getNode(handler)
    }
    if(!node) {
      return
    }
    self.setInternal("activeHandler", handler);
    self.setInternal("node", node);
    self.setInternal("dragNode", node);
    self._prepare(ev)
  };
  return Draggable.extend({_onSetNode:function() {
  }, _onSetContainer:function() {
    this.bindDragEvent()
  }, _onSetDisabledChange:function(d) {
    this.get("container")[d ? "addClass" : "removeClass"](PREFIX_CLS + "-disabled")
  }, bindDragEvent:function() {
    var self = this, node = self.get("container");
    node.on(Node.Gesture.start, handlePreDragStart, self).on("dragstart", self._fixDragStart)
  }, detachDragEvent:function() {
    var self = this;
    self.get("container").detach(Node.Gesture.start, handlePreDragStart, self).detach("dragstart", self._fixDragStart)
  }, _getHandler:function(target) {
    var self = this, node = self.get("container"), handlers = self.get("handlers");
    while(target && target[0] !== node[0]) {
      for(var i = 0;i < handlers.length;i++) {
        var h = handlers[i];
        if(target.test(h)) {
          return target
        }
      }
      target = target.parent()
    }
    return null
  }, _getNode:function(h) {
    return h.closest(this.get("selector"), this.get("container"))
  }}, {ATTRS:{container:{setter:function(v) {
    return $(v)
  }}, selector:{}, handlers:{value:[], getter:0}}})
});
KISSY.add("dd/droppable", ["node", "./ddm", "base"], function(S, require) {
  var Node = require("node"), DDM = require("./ddm"), Base = require("base");
  var PREFIX_CLS = DDM.PREFIX_CLS;
  function validDrop(dropGroups, dragGroups) {
    if(dragGroups === true) {
      return 1
    }
    for(var d in dropGroups) {
      if(dragGroups[d]) {
        return 1
      }
    }
    return 0
  }
  return Base.extend({initializer:function() {
    var self = this;
    self.addTarget(DDM);
    DDM._regDrop(this)
  }, getNodeFromTarget:function(ev, dragNode, proxyNode) {
    var node = this.get("node"), domNode = node[0];
    return domNode === dragNode || domNode === proxyNode ? null : node
  }, _active:function() {
    var self = this, drag = DDM.get("activeDrag"), node = self.get("node"), dropGroups = self.get("groups"), dragGroups = drag.get("groups");
    if(validDrop(dropGroups, dragGroups)) {
      DDM._addValidDrop(self);
      if(node) {
        node.addClass(PREFIX_CLS + "drop-active-valid");
        DDM.cacheWH(node)
      }
    }else {
      if(node) {
        node.addClass(PREFIX_CLS + "drop-active-invalid")
      }
    }
  }, _deActive:function() {
    var node = this.get("node");
    if(node) {
      node.removeClass(PREFIX_CLS + "drop-active-valid").removeClass(PREFIX_CLS + "drop-active-invalid")
    }
  }, __getCustomEvt:function(ev) {
    return S.mix({drag:DDM.get("activeDrag"), drop:this}, ev)
  }, _handleOut:function() {
    var self = this, ret = self.__getCustomEvt();
    self.get("node").removeClass(PREFIX_CLS + "drop-over");
    self.fire("dropexit", ret)
  }, _handleEnter:function(ev) {
    var self = this, e = self.__getCustomEvt(ev);
    e.drag._handleEnter(e);
    self.get("node").addClass(PREFIX_CLS + "drop-over");
    self.fire("dropenter", e)
  }, _handleOver:function(ev) {
    var self = this, e = self.__getCustomEvt(ev);
    e.drag._handleOver(e);
    self.fire("dropover", e)
  }, _end:function() {
    var self = this, ret = self.__getCustomEvt();
    self.get("node").removeClass(PREFIX_CLS + "drop-over");
    self.fire("drophit", ret)
  }, destructor:function() {
    DDM._unRegDrop(this)
  }}, {name:"Droppable", ATTRS:{node:{setter:function(v) {
    if(v) {
      return Node.one(v)
    }
  }}, groups:{value:{}}, disabled:{}}})
});
KISSY.add("dd/droppable-delegate", ["node", "./ddm", "./droppable"], function(S, require) {
  var Node = require("node"), DDM = require("./ddm"), Droppable = require("./droppable");
  function dragStart() {
    var self = this, container = self.get("container"), allNodes = [], selector = self.get("selector");
    container.all(selector).each(function(n) {
      DDM.cacheWH(n);
      allNodes.push(n)
    });
    self.__allNodes = allNodes
  }
  var DroppableDelegate = Droppable.extend({initializer:function() {
    DDM.on("dragstart", dragStart, this)
  }, getNodeFromTarget:function(ev, dragNode, proxyNode) {
    var pointer = {left:ev.pageX, top:ev.pageY}, self = this, allNodes = self.__allNodes, ret = 0, vArea = Number.MAX_VALUE;
    if(allNodes) {
      S.each(allNodes, function(n) {
        var domNode = n[0];
        if(domNode === proxyNode || domNode === dragNode) {
          return
        }
        var r = DDM.region(n);
        if(DDM.inRegion(r, pointer)) {
          var a = DDM.area(r);
          if(a < vArea) {
            vArea = a;
            ret = n
          }
        }
      })
    }
    if(ret) {
      self.setInternal("lastNode", self.get("node"));
      self.setInternal("node", ret)
    }
    return ret
  }, _handleOut:function() {
    var self = this;
    self.callSuper();
    self.setInternal("node", 0);
    self.setInternal("lastNode", 0)
  }, _handleOver:function(ev) {
    var self = this, node = self.get("node"), superOut = DroppableDelegate.superclass._handleOut, superOver = self.callSuper, superEnter = DroppableDelegate.superclass._handleEnter, lastNode = self.get("lastNode");
    if(lastNode[0] !== node[0]) {
      self.setInternal("node", lastNode);
      superOut.apply(self, arguments);
      self.setInternal("node", node);
      superEnter.call(self, ev)
    }else {
      superOver.call(self, ev)
    }
  }, _end:function(e) {
    var self = this;
    self.callSuper(e);
    self.setInternal("node", 0)
  }}, {ATTRS:{lastNode:{}, selector:{}, container:{setter:function(v) {
    return Node.one(v)
  }}}});
  return DroppableDelegate
});
KISSY.add("dd", ["dd/ddm", "dd/draggable", "dd/draggable-delegate", "dd/droppable-delegate", "dd/droppable"], function(S, require) {
  var DDM = require("dd/ddm"), Draggable = require("dd/draggable"), DraggableDelegate = require("dd/draggable-delegate"), DroppableDelegate = require("dd/droppable-delegate"), Droppable = require("dd/droppable");
  var DD = {Draggable:Draggable, DDM:DDM, Droppable:Droppable, DroppableDelegate:DroppableDelegate, DraggableDelegate:DraggableDelegate};
  KISSY.DD = DD;
  return DD
});

