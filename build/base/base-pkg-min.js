/*
Copyright 2010, KISSY UI Library v1.1.5
MIT Licensed
build time: Oct 15 17:04
*/
KISSY.add("base",function(c){function f(d){for(var b=this.constructor,a,e;b;){if(e=b.ATTRS)for(a in e)e.hasOwnProperty(a)&&!this.hasAttr(a)&&this.addAttr(a,e[a]);b=b.superclass?b.superclass.constructor:null}if(d)for(a in d)d.hasOwnProperty(a)&&this._set(a,d[a])}c.augment(f,c.EventTarget,c.Attribute);c.Base=f});
