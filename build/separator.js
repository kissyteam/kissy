/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:30
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 separator/render
 separator
*/

KISSY.add("separator/render", ["component/control"], function(S, require) {
  var Control = require("component/control");
  return Control.getDefaultRender().extend({beforeCreateDom:function(renderData) {
    renderData.elAttrs.role = "separator"
  }})
});
KISSY.add("separator", ["component/control", "separator/render"], function(S, require) {
  var Control = require("component/control");
  var SeparatorRender = require("separator/render");
  return Control.extend({}, {ATTRS:{focusable:{value:false}, disabled:{value:true}, handleMouseEvents:{value:false}, xrender:{value:SeparatorRender}}, xclass:"separator"})
});

