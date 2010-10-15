/*
Copyright 2010, KISSY UI Library v1.1.5
MIT Licensed
build time: Oct 15 14:07
*/
KISSY.add("base",function(d){function e(f){for(var b=this.constructor,a,c;b;){if(c=b.ATTRS)for(a in c)if(c.hasOwnProperty(a)&&!this.hasAttr(a)){if(a in f)c[a].value=f[a];this.addAttr(a,c[a])}b=b.superclass?b.superclass.constructor:null}}d.augment(e,d.EventTarget,d.Attribute);d.Base=e});
