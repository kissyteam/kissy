/*
Copyright (c) 2009, Kissy UI Library. All rights reserved.
MIT Licensed.
http://kissy.googlecode.com/

Date: 2009-12-25 08:34:57
Revision: 352
*/
KISSY.add("tabview",function(d){var g=YAHOO.util,e=g.Dom,f=YAHOO.lang,c="ks-tabview-",a={mackupType:0,navCls:c+"nav",contentCls:c+"content",triggerCls:c+"trigger",panelCls:c+"panel",triggers:[],panels:[],triggerType:"mouse",triggerDelay:0.1,activeIndex:0,activeTriggerCls:c+"trigger-active"};function b(j,l){var k=this;if(f.isArray(j)){for(var n=[],m=0,h=j.length;m<h;m++){n[n.length]=new arguments.callee(j[m],l)}return n}if(!(k instanceof arguments.callee)){return new arguments.callee(j,l)}k.container=e.get(j);if(l.triggerCls){a.mackupType=1}else{if(l.triggers){a.mackupType=2}}k.config=d.merge(a,l||{});k.triggers=[];k.panels=[];k.activeIndex=k.config.activeIndex;k._init()}d.mix(b.prototype,{_init:function(){this._parseMackup();this._initTriggers()},_parseMackup:function(){var v=this,j=v.container,q=v.config,h,r,t=[],s=[],k,l,o,p,u=e.getElementsByClassName;switch(q.mackupType){case 0:h=u(q.navCls,"*",j)[0];r=u(q.contentCls,"*",j)[0];t=e.getChildren(h);s=e.getChildren(r);break;case 1:t=u(q.triggerCls,"*",j);s=u(q.panelCls,"*",j);break;case 2:t=q.triggers;s=q.panels;break}k=t.length;l=s.length;for(o=0,p=k>l?l:k;o<p;o++){v.triggers.push(t[o]);v.panels.push(s[o])}}});d.augment(b,d.Triggerable,false);d.TabView=b});
