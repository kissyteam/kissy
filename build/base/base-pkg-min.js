/*
Copyright 2011, KISSY UI Library v1.1.8dev
MIT Licensed
build time: ${build.time}
*/
KISSY.add("attribute",function(d,f){function g(){this.__attrs={};this.__attrVals={}}function h(a){a+="";return a.charAt(0).toUpperCase()+a.substring(1)}d.augment(g,{__getDefAttrs:function(){return d.clone(this.__attrs)},addAttr:function(a,b){this.__attrs[a]=d.clone(b||{});return this},hasAttr:function(a){return a&&this.__attrs.hasOwnProperty(a)},removeAttr:function(a){if(this.hasAttr(a)){delete this.__attrs[a];delete this.__attrVals[a]}return this},set:function(a,b){var c=this.get(a);if(c!==b)if(false!==
this.__fireAttrChange("before",a,c,b)){this.__set(a,b);this.__fireAttrChange("after",a,c,this.__attrVals[a]);return this}},__fireAttrChange:function(a,b,c,e){return this.fire(a+h(b)+"Change",{attrName:b,prevVal:c,newVal:e})},__set:function(a,b){var c,e=this.__attrs[a];if(e=e&&e.setter)c=e.call(this,b);if(c!==f)b=c;this.__attrVals[a]=b},get:function(a){var b;b=(b=this.__attrs[a])&&b.getter;a=a in this.__attrVals?this.__attrVals[a]:this.__getDefAttrVal(a);if(b)a=b.call(this,a);return a},__getDefAttrVal:function(a){a=
this.__attrs[a];var b;if(a){if(b=a.valueFn){b=b.call(this);if(b!==f)a.value=b;delete a.valueFn}return a.value}},reset:function(a){if(this.hasAttr(a))return this.set(a,this.__getDefAttrVal(a));for(a in this.__attrs)this.hasAttr(a)&&this.reset(a);return this}});d.Attribute=g;g.__capitalFirst=h});
KISSY.add("base",function(d){function f(a){d.Attribute.call(this);for(var b=this.constructor;b;){g(this,b.ATTRS);b=b.superclass?b.superclass.constructor:null}h(this,a)}function g(a,b){if(b)for(var c in b)b.hasOwnProperty(c)&&!a.hasAttr(c)&&a.addAttr(c,b[c])}function h(a,b){if(b)for(var c in b)b.hasOwnProperty(c)&&a.__set(c,b[c])}d.augment(f,d.EventTarget,d.Attribute);d.Base=f});
