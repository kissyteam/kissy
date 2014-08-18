/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:31
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 split-button
*/

KISSY.add("split-button", ["component/container", "button", "menubutton"], function(S, require) {
  var Container = require("component/container");
  require("button");
  require("menubutton");
  return Container.extend({renderUI:function() {
    var self = this, alignWithEl = self.get("alignWithEl"), menuButton = self.get("children")[1], menu = menuButton.get("menu");
    if(alignWithEl) {
      menu.get("align").node = self.$el
    }
  }}, {ATTRS:{handleMouseEvents:{value:false}, focusable:{value:false}, alignWithEl:{value:true}, children:{value:[{xclass:"button"}, {xclass:"menu-button"}]}, menuButton:{getter:function() {
    return this.get("children")[1]
  }, setter:function(v) {
    this.get("children")[1] = v
  }}, button:{getter:function() {
    return this.get("children")[0]
  }, setter:function(v) {
    this.get("children")[0] = v
  }}}, xclass:"split-button"})
});

