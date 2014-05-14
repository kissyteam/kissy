/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 14 22:16
*/
KISSY.add("dd/plugin/constrain",["node","base","util"],function(k,g,i,l){function m(a){var c,d,a=a.drag.get("dragNode"),b=this.get("constrain");if(b&&(f.isWindow(b[0])?this.__constrainRegion={left:c=b.scrollLeft(),top:d=b.scrollTop(),right:c+b.width(),bottom:d+b.height()}:b.getDOMNode?(c=b.offset(),this.__constrainRegion={left:c.left,top:c.top,right:c.left+b.outerWidth(),bottom:c.top+b.outerHeight()}):f.isPlainObject(b)&&(this.__constrainRegion=b),this.__constrainRegion))this.__constrainRegion.right-=
a.outerWidth(),this.__constrainRegion.bottom-=a.outerHeight()}function n(a){var c={},d=a.left,b=a.top,e=this.__constrainRegion;e&&(c.left=Math.min(Math.max(e.left,d),e.right),c.top=Math.min(Math.max(e.top,b),e.bottom),a.drag.setInternal("actualPos",c))}function o(){this.__constrainRegion=null}var i=g("node"),p=g("base"),f=g("util"),h=i.all,d=".-ks-constrain"+f.now(),j=k.Env.host;l.exports=p.extend({pluginId:"dd/plugin/constrain",__constrainRegion:null,pluginInitializer:function(a){a.on("dragstart"+
d,m,this).on("dragend"+d,o,this).on("dragalign"+d,n,this)},pluginDestructor:function(a){a.detach(d,{context:this})}},{ATTRS:{constrain:{value:h(j),setter:function(a){if(a){if(!0===a)return h(j);if(a.nodeType||f.isWindow(a)||"string"===typeof a)return h(a)}return a}}}})});
