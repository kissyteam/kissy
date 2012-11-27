/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Nov 28 02:46
*/
KISSY.add("dd/constrain",function(f,i,j,k){function g(){g.superclass.constructor.apply(this,arguments)}function l(b){var c,e,b=b.drag.get("dragNode"),a=this.get("constrain");if(a){if(!0===a||a.setTimeout){var d;d=!0===a?h(m):h(a);this.__constrainRegion={left:c=d.scrollLeft(),top:e=d.scrollTop(),right:c+d.width(),bottom:e+d.height()}}if(a.nodeType||"string"==typeof a)a=h(a);a.getDOMNode?(c=a.offset(),this.__constrainRegion={left:c.left,top:c.top,right:c.left+a.outerWidth(),bottom:c.top+a.outerHeight()}):
f.isPlainObject(a)&&(this.__constrainRegion=a);this.__constrainRegion&&(this.__constrainRegion.right-=b.outerWidth(),this.__constrainRegion.bottom-=b.outerHeight())}}function n(b){var c={},e=b.left,a=b.top,d=this.__constrainRegion;d&&(c.left=Math.min(Math.max(d.left,e),d.right),c.top=Math.min(Math.max(d.top,a),d.bottom),b.drag.setInternal("actualPos",c))}function o(){this.__constrainRegion=null}var h=j.all,e=".-ks-constrain"+f.now(),m=f.Env.host;f.extend(g,i,{pluginId:"dd/constrain",__constrainRegion:null,
initializer:function(b){b.on("dragstart"+e,l,this).on("dragend"+e,o,this).on("dragalign"+e,n,this)},attachDrag:function(b){this.initializer(b)},detachDrag:function(b){this.destructor(b)},destructor:function(b){b.detach(e,{context:this})},destroy:function(){}},{ATTRS:{constrain:{value:!0}}});return k.Constrain=g},{requires:["base","node","dd/base"]});
