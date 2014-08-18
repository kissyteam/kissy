/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:30
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 resizable/plugin/proxy
*/

KISSY.add("resizable/plugin/proxy", ["node", "base"], function(S, require) {
  var Node = require("node");
  var Base = require("base");
  var $ = Node.all, PROXY_EVENT = ".-ks-proxy" + S.now();
  return Base.extend({pluginId:"resizable/plugin/proxy", pluginInitializer:function(resizable) {
    var self = this, hideNodeOnResize = self.get("hideNodeOnResize");
    function start() {
      var node = self.get("node"), dragNode = resizable.get("node");
      if(!self.get("proxyNode")) {
        if(typeof node === "function") {
          node = node(resizable);
          self.set("proxyNode", node)
        }
      }else {
        node = self.get("proxyNode")
      }
      node.show();
      dragNode.parent().append(node);
      node.css({left:dragNode.css("left"), top:dragNode.css("top"), width:dragNode.width(), height:dragNode.height()});
      if(hideNodeOnResize) {
        dragNode.css("visibility", "hidden")
      }
    }
    function beforeResize(e) {
      e.preventDefault();
      self.get("proxyNode").css(e.region)
    }
    function end() {
      var node = self.get("proxyNode"), dragNode = resizable.get("node");
      dragNode.css({left:node.css("left"), top:node.css("top"), width:node.width(), height:node.height()});
      if(self.get("destroyOnEnd")) {
        node.remove();
        self.set("proxyNode", 0)
      }else {
        node.hide()
      }
      if(hideNodeOnResize) {
        dragNode.css("visibility", "")
      }
    }
    resizable.on("resizeStart" + PROXY_EVENT, start).on("beforeResize" + PROXY_EVENT, beforeResize).on("resizeEnd" + PROXY_EVENT, end)
  }, pluginDestructor:function(resizable) {
    resizable.detach(PROXY_EVENT)
  }}, {ATTRS:{node:{value:function(resizable) {
    return $('<div class="' + resizable.get("prefixCls") + 'resizable-proxy"></div>')
  }}, proxyNode:{}, hideNodeOnResize:{value:false}, destroyOnEnd:{value:false}}})
});

