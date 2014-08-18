/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:24
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/local-storage
*/

KISSY.add("editor/plugin/local-storage", ["editor", "overlay", "./flash-bridge"], function(S, require) {
  var Editor = require("editor");
  var Overlay = require("overlay");
  var FlashBridge = require("./flash-bridge");
  var ie = S.UA.ieMode;
  if((!ie || ie > 8) && window.localStorage) {
    return window.localStorage
  }
  var swfSrc = Editor.Utils.debugUrl("plugin/local-storage/assets/swfstore.swf?t=" + +new Date);
  var css = {width:215, border:"1px solid red"}, reverseCss = {width:0, border:"none"};
  var o = new Overlay({prefixCls:"ks-editor-", elStyle:{background:"white"}, width:"0px", content:'<h1 style="' + 'text-align:center;">\u8bf7\u70b9\u51fb\u5141\u8bb8</h1>' + '<div class="storage-container"></div>', zIndex:Editor.baseZIndex(Editor.ZIndexManager.STORE_FLASH_SHOW)});
  o.render();
  o.show();
  var store = new FlashBridge({src:swfSrc, render:o.get("contentEl").one(".storage-container"), params:{flashVars:{useCompression:true}}, attrs:{height:138, width:"100%"}, methods:["setItem", "removeItem", "getItem", "setMinDiskSpace", "getValueOf"]});
  S.ready(function() {
    setTimeout(function() {
      o.center()
    }, 0)
  });
  store.on("pending", function() {
    o.get("el").css(css);
    o.center();
    o.show();
    setTimeout(function() {
      store.retrySave()
    }, 1E3)
  });
  store.on("save", function() {
    o.get("el").css(reverseCss)
  });
  var oldSet = store.setItem;
  S.mix(store, {_ke:1, getItem:function(k) {
    return this.getValueOf(k)
  }, retrySave:function() {
    var self = this;
    self.setItem(self.lastSave.k, self.lastSave.v)
  }, setItem:function(k, v) {
    var self = this;
    self.lastSave = {k:k, v:v};
    oldSet.call(self, k, v)
  }});
  store.on("contentReady", function() {
    store._ready = 1
  });
  return store
});

