/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:18
*/
KISSY.add("dd/plugin/constrain",["node","base"],function(c,e,h,j){function k(a){var d,e,a=a.drag.get("dragNode"),b=this.get("constrain");if(b&&(c.isWindow(b[0])?this.__constrainRegion={left:d=b.scrollLeft(),top:e=b.scrollTop(),right:d+b.width(),bottom:e+b.height()}:b.getDOMNode?(d=b.offset(),this.__constrainRegion={left:d.left,top:d.top,right:d.left+b.outerWidth(),bottom:d.top+b.outerHeight()}):c.isPlainObject(b)&&(this.__constrainRegion=b),this.__constrainRegion))this.__constrainRegion.right-=a.outerWidth(),
this.__constrainRegion.bottom-=a.outerHeight()}function l(a){var d={},e=a.left,b=a.top,c=this.__constrainRegion;c&&(d.left=Math.min(Math.max(c.left,e),c.right),d.top=Math.min(Math.max(c.top,b),c.bottom),a.drag.setInternal("actualPos",d))}function m(){this.__constrainRegion=null}var h=e("node"),e=e("base"),g=h.all,f=".-ks-constrain"+c.now(),i=c.Env.host;j.exports=e.extend({pluginId:"dd/plugin/constrain",__constrainRegion:null,pluginInitializer:function(a){a.on("dragstart"+f,k,this).on("dragend"+f,
m,this).on("dragalign"+f,l,this)},pluginDestructor:function(a){a.detach(f,{context:this})}},{ATTRS:{constrain:{value:g(i),setter:function(a){if(a){if(!0===a)return g(i);if(a.nodeType||c.isWindow(a)||"string"===typeof a)return g(a)}return a}}}})});
