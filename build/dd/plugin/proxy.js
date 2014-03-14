/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 14 15:43
*/
/*
 Combined modules by KISSY Module Compiler: 

 dd/plugin/proxy
*/

KISSY.add("dd/plugin/proxy", ["node", "dd", "base"], function(S, require) {
  var Node = require("node"), DD = require("dd"), Base = require("base");
  var DDM = DD.DDM, PROXY_EVENT = ".-ks-proxy" + S.now();
  return Base.extend({pluginId:"dd/plugin/proxy", pluginInitializer:function(drag) {
    var self = this;
    function start() {
      var node = self.get("node"), dragNode = drag.get("node");
      if(!self.get("proxyNode")) {
        if(typeof node === "function") {
          node = node(drag);
          node.addClass("ks-dd-proxy");
          self.set("proxyNode", node)
        }
      }else {
        node = self.get("proxyNode")
      }
      node.show();
      dragNode.parent().append(node);
      DDM.cacheWH(node);
      node.offset(dragNode.offset());
      drag.setInternal("dragNode", dragNode);
      drag.setInternal("node", node)
    }
    function end() {
      var node = self.get("proxyNode"), dragNode = drag.get("dragNode");
      if(self.get("moveOnEnd")) {
        dragNode.offset(node.offset())
      }
      if(self.get("destroyOnEnd")) {
        node.remove();
        self.set("proxyNode", 0)
      }else {
        node.hide()
      }
      drag.setInternal("node", dragNode)
    }
    drag.on("dragstart" + PROXY_EVENT, start).on("dragend" + PROXY_EVENT, end)
  }, pluginDestructor:function(drag) {
    drag.detach(PROXY_EVENT)
  }}, {ATTRS:{node:{value:function(drag) {
    return new Node(drag.get("node").clone(true))
  }}, destroyOnEnd:{value:false}, moveOnEnd:{value:true}, proxyNode:{}}})
});

