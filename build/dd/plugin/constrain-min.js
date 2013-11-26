/*
Copyright 2013, KISSY v1.50dev
MIT Licensed
build time: Nov 27 00:39
*/
KISSY.add("dd/plugin/constrain",["node","base"],function(c,g){function i(a){var d,e,a=a.drag.get("dragNode"),b=this.get("constrain");if(b&&(c.isWindow(b[0])?this.__constrainRegion={left:d=b.scrollLeft(),top:e=b.scrollTop(),right:d+b.width(),bottom:e+b.height()}:b.getDOMNode?(d=b.offset(),this.__constrainRegion={left:d.left,top:d.top,right:d.left+b.outerWidth(),bottom:d.top+b.outerHeight()}):c.isPlainObject(b)&&(this.__constrainRegion=b),this.__constrainRegion))this.__constrainRegion.right-=a.outerWidth(),
this.__constrainRegion.bottom-=a.outerHeight()}function j(a){var d={},e=a.left,b=a.top,c=this.__constrainRegion;c&&(d.left=Math.min(Math.max(c.left,e),c.right),d.top=Math.min(Math.max(c.top,b),c.bottom),a.drag.setInternal("actualPos",d))}function k(){this.__constrainRegion=null}var l=g("node"),m=g("base"),f=l.all,e=".-ks-constrain"+c.now(),h=c.Env.host;return m.extend({pluginId:"dd/plugin/constrain",__constrainRegion:null,pluginInitializer:function(a){a.on("dragstart"+e,i,this).on("dragend"+e,k,this).on("dragalign"+
e,j,this)},pluginDestructor:function(a){a.detach(e,{context:this})}},{ATTRS:{constrain:{value:f(h),setter:function(a){if(a){if(!0===a)return f(h);if(a.nodeType||c.isWindow(a)||"string"==typeof a)return f(a)}return a}}}})});
