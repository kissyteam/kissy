/*
Copyright (c) 2009, Kissy UI Library. All rights reserved.
MIT Licensed.
http://kissy.googlecode.com/

Date: 2009-12-22 23:10:52
Revision: 333
*/
KISSY.add("tabview",function(d){var f=YAHOO.util,e=f.Dom,b="ks-tabview-",a={mackupType:0,navCls:b+"nav",contentCls:b+"content",triggerCls:b+"trigger",panelCls:b+"panel",triggers:[],panels:[],triggerType:"mouse",triggerDelay:0.1,activeIndex:0,activeTriggerCls:b+"trigger-active"};function c(g,h){if(!(this instanceof arguments.callee)){return new arguments.callee(g,h)}this.container=e.get(g);this.config=d.merge(a,h||{});this.triggers=[];this.panels=[];this.activeIndex=this.config.activeIndex;this._init()}d.mix(c.prototype,{_init:function(){this._parseMackup();this._initTriggers()},_parseMackup:function(){var u=this,h=u.container,p=u.config,g,q,s=[],r=[],j,k,l,o,t=e.getElementsByClassName;switch(p.mackupType){case 0:g=t(p.navCls,"*",h)[0];q=t(p.contentCls,"*",h)[0];s=e.getChildren(g);r=e.getChildren(q);break;case 1:s=t(p.triggerCls,"*",h);r=t(p.panelCls,"*",h);break;case 2:s=p.triggers;r=p.panels;break}j=s.length;k=r.length;for(l=0,o=j>k?k:j;l<o;l++){u.triggers.push(s[l]);u.panels.push(r[l])}}});d.augment(c,d.Triggerable);d.TabView=c});
