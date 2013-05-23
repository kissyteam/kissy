/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: May 23 11:49
*/
KISSY.add("anim/transition",function(c,h,l,n){function o(b){var a="";c.each(b,function(b,f){a&&(a+=",");a+=f+" "+b.duration+"s "+b.easing+" "+b.delay+"s"});return a}function k(b){k.superclass.constructor.apply(this,arguments)}var i=c.Features.getTransitionPrefix(),m=i?i.toLowerCase()+"TransitionEnd":"transitionend",j=i?i+"Transition":"transition";c.extend(k,n,{doStart:function(){var b=this,a=b.el,d=a.style,f=b._propsData,e=d[j],g={};c.each(f,function(f,d){var e=f.value,c=h.css(a,d);"number"==typeof e&&
(c=parseFloat(c));c==e&&setTimeout(function(){b._onTransitionEnd({originalEvent:{propertyName:d}})},0);g[d]=e});-1!=e.indexOf("none")?e="":e&&(e+=",");d[j]=e+o(f);l.on(a,m,b._onTransitionEnd,b);h.css(a,g)},beforeResume:function(){var b=this._propsData,a=c.merge(b),d=this._runTime/1E3;c.each(a,function(a,e){var c=d;a.delay>=c?a.delay-=c:(c-=a.delay,a.delay=0,a.duration>=c?a.duration-=c:delete b[e])})},_onTransitionEnd:function(b){var b=b.originalEvent,a=1,d=this._propsData;d[b.propertyName]&&(d[b.propertyName].finished=
1,c.each(d,function(b){if(!b.finished)return a=0,!1}),a&&this.stop(!0))},doStop:function(b){var a=this.el,d=a.style,f=this._propsData,e=[],g={};l.detach(a,m,this._onTransitionEnd,this);c.each(f,function(c,d){b||(g[d]=h.css(a,d));e.push(d)});f=c.trim(d[j].replace(RegExp("(^|,)\\s*(?:"+e.join("|")+")\\s+[^,]+","gi"),"$1")).replace(/^,|,,|,$/g,"")||"none";d[j]=f;h.css(a,g)}});return k},{requires:["dom","event","./base"]});
