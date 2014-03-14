/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 14 15:43
*/
/*
 Combined modules by KISSY Module Compiler: 

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
  var UA = S.UA, $ = Node.all, win = S.Env.host, doc = win.document, $doc = $(doc), $win = $(win), ie6 = UA.ie === 6, MOVE_DELAY = 30, SHIM_Z_INDEX = 999999;
  var DDManger = Base.extend({addDrop:function(d) {
    this.get("drops").push(d)
  }, removeDrop:function(d) {
    var self = this, drops = self.get("drops"), index = S.indexOf(d, drops);
    if(index !== -1) {
      drops.splice(index, 1)
    }
  }, start:function(e, drag) {
    var self = this;
    self.setInternal("activeDrag", drag);
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
  }, addValidDrop:function(drop) {
    this.get("validDrops").push(drop)
  }, _notifyDropsMove:function(ev, activeDrag) {
    var self = this;
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
  }, move:function(ev, activeDrag) {
    var self = this;
    if(self.__needDropCheck) {
      self._notifyDropsMove(ev, activeDrag)
    }
  }, end:function(e) {
    var self = this, activeDrop = self.get("activeDrop");
    if(self._shim) {
      self._shim.hide()
    }
    _deActiveDrops(self);
    if(activeDrop) {
      activeDrop._end(e)
    }
    self.setInternal("activeDrop", null);
    self.setInternal("activeDrag", null)
  }}, {ATTRS:{dragCursor:{value:"move"}, activeDrag:{}, activeDrop:{}, drops:{value:[]}, validDrops:{value:[]}}});
  var activeShim = function(self) {
    self._shim = $("<div " + 'style="' + "background-color:red;" + "position:" + (ie6 ? "absolute" : "fixed") + ";" + "left:0;" + "width:100%;" + "height:100%;" + "top:0;" + "cursor:" + self.get("dragCursor") + ";" + "z-index:" + SHIM_Z_INDEX + ";" + '"><' + "/div>").prependTo(doc.body || doc.documentElement).css("opacity", 0);
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
  var DDM = new DDManger;
  DDM.inRegion = inRegion;
  DDM.region = region;
  DDM.area = area;
  DDM.cacheWH = cacheWH;
  DDM.PREFIX_CLS = "ks-dd-";
  return DDM
});
KISSY.add("dd/draggable", ["node", "./ddm", "base", "event/gesture/drag"], function(S, require) {
  var Node = require("node"), Gesture = Node.Gesture, DDM = require("./ddm"), Base = require("base"), DragType = require("event/gesture/drag");
  var UA = S.UA, $ = Node.all, $doc = $(document), each = S.each, ie = UA.ie, PREFIX_CLS = DDM.PREFIX_CLS, doc = S.Env.host.document;
  function checkValid(fn) {
    return function() {
      if(this._isValidDrag) {
        fn.apply(this, arguments)
      }
    }
  }
  var onDragStart = checkValid(function(e) {
    this._start(e)
  });
  var onDrag = checkValid(function(e) {
    this._move(e)
  });
  var onDragEnd = checkValid(function(e) {
    this._end(e)
  });
  var Draggable = Base.extend({initializer:function() {
    var self = this;
    self.addTarget(DDM);
    self._allowMove = self.get("move")
  }, _onSetNode:function(n) {
    var self = this;
    self.setInternal("dragNode", n)
  }, onGestureStart:function(e) {
    var self = this, t = e.target;
    if(self._checkDragStartValid(e)) {
      if(!self._checkHandler(t)) {
        return
      }
      self._prepare(e)
    }
  }, getEventTargetEl:function() {
    return this.get("node")
  }, start:function() {
    var self = this, node = self.getEventTargetEl();
    if(node) {
      node.on(DragType.DRAG_START, onDragStart, self).on(DragType.DRAG, onDrag, self).on(DragType.DRAG_END, onDragEnd, self).on(Gesture.start, onGestureStart, self).on("dragstart", self._fixDragStart)
    }
  }, stop:function() {
    var self = this, node = self.getEventTargetEl();
    if(node) {
      node.detach(DragType.DRAG_START, onDragStart, self).detach(DragType.DRAG, onDrag, self).detach(DragType.DRAG_END, onDragEnd, self).detach(Gesture.start, onGestureStart, self).detach("dragstart", self._fixDragStart)
    }
  }, _onSetDisabled:function(d) {
    var self = this, node = self.get("dragNode");
    if(node) {
      node[d ? "addClass" : "removeClass"](PREFIX_CLS + "-disabled")
    }
    self[d ? "stop" : "start"]()
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
  }, _checkDragStartValid:function(e) {
    var self = this;
    if(self.get("primaryButtonOnly") && e.which !== 1) {
      return 0
    }
    return 1
  }, _prepare:function(e) {
    var self = this;
    self._isValidDrag = 1;
    if(ie) {
      fixIEMouseDown();
      $doc.on(Gesture.end, {fn:fixIEMouseUp, once:true})
    }
    if(self.get("halt")) {
      e.stopPropagation()
    }
    if(e.gestureType === "mouse") {
      e.preventDefault()
    }
    if(self._allowMove) {
      self.setInternal("startNodePos", self.get("node").offset())
    }
  }, _start:function(e) {
    var self = this;
    self.mousePos = {left:e.pageX, top:e.pageY};
    DDM.start(e, self);
    self.fire("dragstart", {drag:self, gestureType:e.gestureType, startPos:e.startPos, deltaX:e.deltaX, deltaY:e.deltaY, pageX:e.pageX, pageY:e.pageY});
    self.get("dragNode").addClass(PREFIX_CLS + "dragging")
  }, _move:function(e) {
    var self = this, pageX = e.pageX, pageY = e.pageY;
    if(e.gestureType === "touch") {
      e.preventDefault()
    }
    self.mousePos = {left:pageX, top:pageY};
    var customEvent = {drag:self, gestureType:e.gestureType, startPos:e.startPos, deltaX:e.deltaX, deltaY:e.deltaY, pageX:e.pageX, pageY:e.pageY};
    var move = self._allowMove;
    if(move) {
      var startNodePos = self.get("startNodePos");
      var left = startNodePos.left + e.deltaX, top = startNodePos.top + e.deltaY;
      customEvent.left = left;
      customEvent.top = top;
      self.setInternal("actualPos", {left:left, top:top});
      self.fire("dragalign", customEvent)
    }
    var def = 1;
    if(self.fire("drag", customEvent) === false) {
      def = 0
    }
    DDM.move(e, self);
    if(self.get("preventDefaultOnMove")) {
      e.preventDefault()
    }
    if(def && move) {
      self.get("node").offset(self.get("actualPos"))
    }
  }, stopDrag:function() {
    if(this._isValidDrag) {
      this._end()
    }
  }, _end:function(e) {
    e = e || {};
    var self = this, activeDrop;
    self._isValidDrag = 0;
    self.get("node").removeClass(PREFIX_CLS + "drag-over");
    self.get("dragNode").removeClass(PREFIX_CLS + "dragging");
    if(activeDrop = DDM.get("activeDrop")) {
      self.fire("dragdrophit", {drag:self, drop:activeDrop})
    }else {
      self.fire("dragdropmiss", {drag:self})
    }
    DDM.end(e, self);
    self.fire("dragend", {drag:self, gestureType:e.gestureType, startPos:e.startPos, deltaX:e.deltaX, deltaY:e.deltaY, pageX:e.pageX, pageY:e.pageY})
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
  }, destructor:function() {
    this.stop()
  }}, {name:"Draggable", ATTRS:{node:{setter:function(v) {
    if(!(v instanceof Node)) {
      return $(v)
    }
    return undefined
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
  }}, activeHandler:{}, mode:{value:"point"}, disabled:{value:false}, move:{value:false}, primaryButtonOnly:{value:true}, halt:{value:true}, groups:{value:true}, startNodePos:{}, actualPos:{}, preventDefaultOnMove:{value:true}}, inheritedStatics:{DropMode:{POINT:"point", INTERSECT:"intersect", STRICT:"strict"}}});
  var _ieSelectBack;
  function fixIEMouseUp() {
    doc.body.onselectstart = _ieSelectBack;
    if(doc.body.releaseCapture) {
      doc.body.releaseCapture()
    }
  }
  function fixIEMouseDown() {
    _ieSelectBack = doc.body.onselectstart;
    doc.body.onselectstart = fixIESelect;
    if(doc.body.setCapture) {
      doc.body.setCapture()
    }
  }
  function fixDragStart(e) {
    e.preventDefault()
  }
  function fixIESelect() {
    return false
  }
  function onGestureStart(e) {
    this._isValidDrag = 0;
    this.onGestureStart(e)
  }
  return Draggable
});
KISSY.add("dd/draggable-delegate", ["node", "./ddm", "./draggable"], function(S, require) {
  var Node = require("node"), DDM = require("./ddm"), Draggable = require("./draggable"), PREFIX_CLS = DDM.PREFIX_CLS, $ = Node.all;
  return Draggable.extend({_onSetNode:S.noop, _onSetDisabled:function(d) {
    var self = this;
    var container = self.get("container");
    if(container) {
      container[d ? "addClass" : "removeClass"](PREFIX_CLS + "-disabled");
      self[d ? "stop" : "start"]()
    }
  }, getEventTargetEl:function() {
    return this.get("container")
  }, onGestureStart:function(ev) {
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
  var Node = require("node"), DDM = require("./ddm"), Base = require("base"), PREFIX_CLS = DDM.PREFIX_CLS;
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
    DDM.addDrop(this)
  }, getNodeFromTarget:function(ev, dragNode, proxyNode) {
    var node = this.get("node"), domNode = node[0];
    return domNode === dragNode || domNode === proxyNode ? null : node
  }, _active:function() {
    var self = this, drag = DDM.get("activeDrag"), node = self.get("node"), dropGroups = self.get("groups"), dragGroups = drag.get("groups");
    if(validDrop(dropGroups, dragGroups)) {
      DDM.addValidDrop(self);
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
    DDM.removeDrop(this)
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

