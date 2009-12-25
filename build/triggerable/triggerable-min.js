/*
Copyright (c) 2009, Kissy UI Library. All rights reserved.
MIT Licensed.
http://kissy.googlecode.com/

Date: 2009-12-25 17:11:08
Revision: 359
*/
KISSY.add("triggerable",function(d){var h=YAHOO.util,e=h.Dom,b=h.Event,f=YAHOO.lang,c="beforeSwitch",a="onSwitch";function g(){}d.mix(g.prototype,{_initTriggers:function(){var i=this;i.createEvent(c);i.createEvent(a);i._bindTriggers()},_bindTriggers:function(){var l=this,k=l.config,o=l.triggers,n,j=o.length,m;for(n=0;n<j;n++){(function(i){m=o[i];b.on(m,"click",function(){l._onFocusTrigger(i)});b.on(m,"focus",function(){l._onFocusTrigger(i)});if(k.triggerType==="mouse"){b.on(m,"mouseenter",function(){l._onMouseEnterTrigger(i)});b.on(m,"mouseleave",function(){l._onMouseLeaveTrigger(i)})}})(n)}},_onFocusTrigger:function(j){var i=this;if(i.activeIndex===j){return}if(i.showTimer){i.showTimer.cancel()}i.switchTo(j)},_onMouseEnterTrigger:function(j){var i=this;if(i.activeIndex!==j){i.showTimer=f.later(i.config.triggerDelay*1000,i,function(){i.switchTo(j)})}},_onMouseLeaveTrigger:function(){var i=this;if(i.showTimer){i.showTimer.cancel()}},switchTo:function(n){var k=this,j=k.config,i=k.activeIndex,o=k.triggers,m=k.panels,l=m[k.activeIndex],p=m[n];if(!k.fireEvent(c,n)){return k}if(i>=0){e.removeClass(o[i],j.activeTriggerCls)}e.addClass(o[n],j.activeTriggerCls);if(k.loadCustomLazyData){k.loadCustomLazyData(p)}k._switchContent(l,p,n);k.activeIndex=n;return k},_switchContent:function(k,l,j){var i=this;k.style.display="none";l.style.display="block";i.fireEvent(a,j)}});d.augment(g,h.EventProvider);if(d.DataLazyload){d.augment(g,d.DataLazyload,true,["loadCustomLazyData"])}d.Triggerable=g});
