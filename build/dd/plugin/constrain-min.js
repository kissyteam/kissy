/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:14
*/
KISSY.add("dd/plugin/constrain",function(c,i,j){function f(){f.superclass.constructor.apply(this,arguments)}function k(a){var d,e,a=a.drag.get("dragNode"),b=this.get("constrain");if(b&&(c.isWindow(b[0])?this.__constrainRegion={left:d=b.scrollLeft(),top:e=b.scrollTop(),right:d+b.width(),bottom:e+b.height()}:b.getDOMNode?(d=b.offset(),this.__constrainRegion={left:d.left,top:d.top,right:d.left+b.outerWidth(),bottom:d.top+b.outerHeight()}):c.isPlainObject(b)&&(this.__constrainRegion=b),this.__constrainRegion))this.__constrainRegion.right-=
a.outerWidth(),this.__constrainRegion.bottom-=a.outerHeight()}function l(a){var d={},e=a.left,b=a.top,c=this.__constrainRegion;c&&(d.left=Math.min(Math.max(c.left,e),c.right),d.top=Math.min(Math.max(c.top,b),c.bottom),a.drag.setInternal("actualPos",d))}function m(){this.__constrainRegion=null}var g=j.all,e=".-ks-constrain"+c.now(),h=c.Env.host;c.extend(f,i,{pluginId:"dd/plugin/constrain",__constrainRegion:null,pluginInitializer:function(a){a.on("dragstart"+e,k,this).on("dragend"+e,m,this).on("dragalign"+
e,l,this)},pluginDestructor:function(a){a.detach(e,{context:this})}},{ATTRS:{constrain:{value:g(h),setter:function(a){if(a){if(!0===a)return g(h);if(a.nodeType||c.isWindow(a)||"string"==typeof a)return g(a)}}}}});return f},{requires:["base","node"]});
