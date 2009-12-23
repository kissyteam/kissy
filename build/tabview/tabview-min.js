/*
Copyright (c) 2009, Kissy UI Library. All rights reserved.
MIT Licensed.
http://kissy.googlecode.com/

Date: 2009-12-23 08:44:19
Revision: 334
*/
KISSY.add("tabview",function(d){var g=YAHOO.util,e=g.Dom,f=YAHOO.lang,b="ks-tabview-",a={mackupType:0,navCls:b+"nav",contentCls:b+"content",triggerCls:b+"trigger",panelCls:b+"panel",triggers:[],panels:[],triggerType:"mouse",triggerDelay:0.1,activeIndex:0,activeTriggerCls:b+"trigger-active"};function c(j,k){if(f.isArray(j)){for(var m=[],l=0,h=j.length;l<h;l++){m[m.length]=new arguments.callee(j[l],k)}return m}if(!(this instanceof arguments.callee)){return new arguments.callee(j,k)}this.container=e.get(j);this.config=d.merge(a,k||{});this.triggers=[];this.panels=[];this.activeIndex=this.config.activeIndex;this._init()}d.mix(c.prototype,{_init:function(){this._parseMackup();this._initTriggers()},_parseMackup:function(){var v=this,j=v.container,q=v.config,h,r,t=[],s=[],k,l,o,p,u=e.getElementsByClassName;switch(q.mackupType){case 0:h=u(q.navCls,"*",j)[0];r=u(q.contentCls,"*",j)[0];t=e.getChildren(h);s=e.getChildren(r);break;case 1:t=u(q.triggerCls,"*",j);s=u(q.panelCls,"*",j);break;case 2:t=q.triggers;s=q.panels;break}k=t.length;l=s.length;for(o=0,p=k>l?l:k;o<p;o++){v.triggers.push(t[o]);v.panels.push(s[o])}}});d.augment(c,d.Triggerable);d.TabView=c});
