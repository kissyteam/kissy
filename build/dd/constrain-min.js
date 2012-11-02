/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Nov 2 15:44
*/
KISSY.add("dd/constrain",function(f,o,p,q){function h(){h.superclass.constructor.apply(this,arguments);this[g]={}}function j(b){var a,e,b=b.drag.get("dragNode"),c=this.get("constrain");if(c){if(!0===c||c.setTimeout){var d;d=!0===c?i(r):i(c);this.__constrainRegion={left:a=d.scrollLeft(),top:e=d.scrollTop(),right:a+d.width(),bottom:e+d.height()}}if(c.nodeType||"string"==typeof c)c=i(c);c.getDOMNode?(a=c.offset(),this.__constrainRegion={left:a.left,top:a.top,right:a.left+c.outerWidth(),bottom:a.top+
c.outerHeight()}):f.isPlainObject(c)&&(this.__constrainRegion=c);this.__constrainRegion&&(this.__constrainRegion.right-=b.outerWidth(),this.__constrainRegion.bottom-=b.outerHeight())}}function k(b){var a={},e=b.left,c=b.top,d=this.__constrainRegion;d&&(a.left=Math.min(Math.max(d.left,e),d.right),a.top=Math.min(Math.max(d.top,c),d.bottom),b.drag.setInternal("actualPos",a))}function l(){this.__constrainRegion=null}var i=p.all,g="__constrain_destructors",m=f.stamp,n=f.guid("__dd_constrain"),r=f.Env.host;
f.extend(h,o,{__constrainRegion:null,attachDrag:function(b){var a=this[g],e=m(b,0,n);if(a[e])return this;a[e]=b;b.on("dragstart",j,this).on("dragend",l,this).on("dragalign",k,this);return this},detachDrag:function(b){var a=m(b,1,n),e=this[g];a&&e[a]&&(b.detach("dragstart",j,this).detach("dragend",l,this).detach("dragalign",k,this),delete e[a]);return this},destroy:function(){var b=this,a=f.merge(b[g]);f.each(a,function(a){b.detachDrag(a)})}},{ATTRS:{constrain:{value:!0}}});return q.Constrain=h},{requires:["base",
"node","dd/base"]});
