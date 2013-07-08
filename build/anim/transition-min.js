/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 3 13:48
*/
KISSY.add("anim/transition",function(c,h,k,n){function o(b){var a="";c.each(b,function(b,f){a&&(a+=",");a+=f+" "+b.duration+"s "+b.easing+" "+b.delay+"s"});return a}function j(b){j.superclass.constructor.apply(this,arguments)}var l=c.Features.getTransitionPrefix(),m=l?l.toLowerCase()+"TransitionEnd":"transitionend",i=c.Features.getTransitionProperty();c.extend(j,n,{doStart:function(){var b=this,a=b.node,d=a.style,f=b._propsData,e=d[i],g={};c.each(f,function(f,d){var e=f.value,c=h.css(a,d);"number"==
typeof e&&(c=parseFloat(c));c==e&&setTimeout(function(){b._onTransitionEnd({originalEvent:{propertyName:d}})},0);g[d]=e});-1!=e.indexOf("none")?e="":e&&(e+=",");d[i]=e+o(f);k.on(a,m,b._onTransitionEnd,b);h.css(a,g)},beforeResume:function(){var b=this._propsData,a=c.merge(b),d=this._runTime/1E3;c.each(a,function(a,e){var c=d;a.delay>=c?a.delay-=c:(c-=a.delay,a.delay=0,a.duration>=c?a.duration-=c:delete b[e])})},_onTransitionEnd:function(b){var b=b.originalEvent,a=1,d=this._propsData;d[b.propertyName]&&
(d[b.propertyName].finished=1,c.each(d,function(b){if(!b.finished)return a=0,!1}),a&&this.stop(!0))},doStop:function(b){var a=this.node,d=a.style,f=this._propsData,e=[],g={};k.detach(a,m,this._onTransitionEnd,this);c.each(f,function(c,d){b||(g[d]=h.css(a,d));e.push(d)});f=c.trim(d[i].replace(RegExp("(^|,)\\s*(?:"+e.join("|")+")\\s+[^,]+","gi"),"$1")).replace(/^,|,,|,$/g,"")||"none";d[i]=f;h.css(a,g)}});return j},{requires:["dom","event","./base"]});
