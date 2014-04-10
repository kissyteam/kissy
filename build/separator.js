/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 10 18:50
*/
/*
 Combined modules by KISSY Module Compiler: 

 separator
*/

KISSY.add("separator", ["component/control"], function(S, require) {
  var Control = require("component/control");
  return Control.extend({beforeCreateDom:function(renderData) {
    renderData.elAttrs.role = "separator"
  }}, {ATTRS:{focusable:{value:false}, disabled:{value:true}, handleGestureEvents:{value:false}}, xclass:"separator"})
});

