/*
Copyright (c) 2009, Kissy UI Library. All rights reserved.
MIT Licensed.
http://kissy.googlecode.com/

Date: 2009-12-22 23:10:54
Revision: 333
*/
KISSY.add("triggerable",function(d){var h=YAHOO.util,e=h.Dom,b=h.Event,f=YAHOO.lang,c="beforeSwitch",a="onSwitch";function g(){}d.mix(g.prototype,{_initTriggers:function(){this.createEvent(c);this.createEvent(a);this._bindTriggers()},_bindTriggers:function(){var l=this,k=l.config,o=l.triggers,n,j=o.length,m;for(n=0;n<j;n++){(function(i){m=o[i];b.on(m,"click",function(){l._onFocusTrigger(i)});b.on(m,"focus",function(){l._onFocusTrigger(i)});if(k.triggerType==="mouse"){b.on(m,"mouseenter",function(){l._onMouseEnterTrigger(i)});b.on(m,"mouseleave",function(){l._onMouseLeaveTrigger(i)})}})(n)}},_onFocusTrigger:function(j){var i=this;if(i.showTimer){i.showTimer.cancel()}if(i.activeIndex===j){return}i.switchTo(j)},_onMouseEnterTrigger:function(j){var i=this;if(i.activeIndex!==j){i.showTimer=f.later(i.config.triggerDelay*1000,i,function(){i.switchTo(j)})}},_onMouseLeaveTrigger:function(){var i=this;if(i.showTimer){i.showTimer.cancel()}},switchTo:function(m){var j=this,i=j.config,n=j.triggers,l=j.panels,k=l[j.activeIndex],o=l[m];if(!j.fireEvent(c,m)){return j}e.removeClass(n[j.activeIndex],i.activeTriggerCls);e.addClass(n[m],i.activeTriggerCls);j._switchContent(k,o,m);j.activeIndex=m;j.fireEvent(a,m);return j},_switchContent:function(i,j){i.style.display="none";j.style.display=""}});d.augment(g,h.EventProvider);d.Triggerable=g});
