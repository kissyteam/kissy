/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 13:54
*/
KISSY.add("dd/plugin/constrain",["base","util","node"],function(i,g,o,k){function l(a){var c,d,a=a.drag.get("dragNode"),b=this.get("constrain");if(b&&(f.isWindow(b[0])?this.__constrainRegion={left:c=b.scrollLeft(),top:d=b.scrollTop(),right:c+b.width(),bottom:d+b.height()}:b.getDOMNode?(c=b.offset(),this.__constrainRegion={left:c.left,top:c.top,right:c.left+b.outerWidth(),bottom:c.top+b.outerHeight()}):f.isPlainObject(b)&&(this.__constrainRegion=b),this.__constrainRegion))this.__constrainRegion.right-=
a.outerWidth(),this.__constrainRegion.bottom-=a.outerHeight()}function m(a){var c={},d=a.left,b=a.top,e=this.__constrainRegion;e&&(c.left=Math.min(Math.max(e.left,d),e.right),c.top=Math.min(Math.max(e.top,b),e.bottom),a.drag.setInternal("actualPos",c))}function n(){this.__constrainRegion=null}var i=g("base"),f=g("util"),h=g("node"),d=".-ks-constrain"+f.now(),j=window;k.exports=i.extend({pluginId:"dd/plugin/constrain",__constrainRegion:null,pluginInitializer:function(a){a.on("dragstart"+d,l,this).on("dragend"+
d,n,this).on("dragalign"+d,m,this)},pluginDestructor:function(a){a.detach(d,{context:this})}},{ATTRS:{constrain:{valueFn:function(){return h(j)},setter:function(a){if(a){if(!0===a)return h(j);if(a.nodeType||f.isWindow(a)||"string"===typeof a)return h(a)}return a}}}})});
