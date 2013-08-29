/*
Copyright 2013, KISSY v1.40dev
MIT Licensed
build time: Aug 30 01:36
*/
KISSY.add("dd/plugin/constrain",function(c,h,i){function j(a){var d,e,a=a.drag.get("dragNode"),b=this.get("constrain");if(b&&(c.isWindow(b[0])?this.__constrainRegion={left:d=b.scrollLeft(),top:e=b.scrollTop(),right:d+b.width(),bottom:e+b.height()}:b.getDOMNode?(d=b.offset(),this.__constrainRegion={left:d.left,top:d.top,right:d.left+b.outerWidth(),bottom:d.top+b.outerHeight()}):c.isPlainObject(b)&&(this.__constrainRegion=b),this.__constrainRegion))this.__constrainRegion.right-=a.outerWidth(),this.__constrainRegion.bottom-=
a.outerHeight()}function k(a){var d={},e=a.left,b=a.top,c=this.__constrainRegion;c&&(d.left=Math.min(Math.max(c.left,e),c.right),d.top=Math.min(Math.max(c.top,b),c.bottom),a.drag.setInternal("actualPos",d))}function l(){this.__constrainRegion=null}var f=i.all,e=".-ks-constrain"+c.now(),g=c.Env.host;return h.extend({pluginId:"dd/plugin/constrain",__constrainRegion:null,pluginInitializer:function(a){a.on("dragstart"+e,j,this).on("dragend"+e,l,this).on("dragalign"+e,k,this)},pluginDestructor:function(a){a.detach(e,
{context:this})}},{ATTRS:{constrain:{value:f(g),setter:function(a){if(a){if(!0===a)return f(g);if(a.nodeType||c.isWindow(a)||"string"==typeof a)return f(a)}return a}}}})},{requires:["base","node"]});
