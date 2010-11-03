/*
Copyright 2010, KISSY UI Library v1.1.5
MIT Licensed
build time: Nov 2 13:10
*/
KISSY.add("attribute",function(e,g){function h(){}function i(a){a+="";return a.charAt(0).toUpperCase()+a.substring(1)}e.augment(h,{__initAttrs:function(){if(!this.__attrs){this.__attrs={};this.__attrVals={}}},addAttr:function(a,b){this.__initAttrs();this.__attrs[a]=e.clone(b||{});return this},addAttrs:function(a,b){var c=this;e.each(a,function(d,f){if(f in b)d.value=b[f];c.addAttr(f,d)});return c},hasAttr:function(a){return a&&a in(this.__attrs||{})},removeAttr:function(a){if(this.hasAttr(a)){delete this.__attrs.name;
delete this.__attrVals.name}return this},set:function(a,b){var c=this.get(a);if(c!==b)if(false!==this.__fireAttrChange("before",a,c,b)){this.__set(a,b);this.__fireAttrChange("after",a,c,this.__attrVals[a]);return this}},__fireAttrChange:function(a,b,c,d){return this.fire(a+i(b)+"Change",{attrName:b,prevVal:c,newVal:d})},__set:function(a,b){var c,d=this.__attrs[a];if(d=d&&d.setter)c=d.call(this,b);if(c!==g)b=c;this.__attrVals[a]=b},get:function(a){var b;this.__initAttrs();b=(b=this.__attrs[a])&&b.getter;
a=a in this.__attrVals?this.__attrVals[a]:this.__getDefAttrVal(a);if(b)a=b.call(this,a);return a},__getDefAttrVal:function(a){a=this.__attrs[a];var b;if(a){if(b=a.valueFn){b=b.call(this);if(b!==g)a.value=b;delete a.valueFn}return a.value}},reset:function(a){if(this.hasAttr(a))return this.set(a,this.__getDefAttrVal(a));for(a in this.__attrs)this.hasAttr(a)&&this.reset(a);return this}});e.Attribute=h});
