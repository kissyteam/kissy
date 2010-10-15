/*
Copyright 2010, KISSY UI Library v1.1.5
MIT Licensed
build time: Oct 15 16:43
*/
KISSY.add("base",function(d){function f(e){for(var b=this.constructor,a,c;b;){if(c=b.ATTRS)for(a in c)if(c.hasOwnProperty(a)&&!this.hasAttr(a)){if(e&&a in e)c[a].value=e[a];this.addAttr(a,c[a])}b=b.superclass?b.superclass.constructor:null}}d.augment(f,d.EventTarget,d.Attribute);d.Base=f});
