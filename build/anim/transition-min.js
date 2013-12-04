/*
Copyright 2013, KISSY v1.41
MIT Licensed
build time: Dec 4 22:04
*/
KISSY.add("anim/transition",["dom","event/dom","./base"],function(g,h){function p(c){var b="";g.each(c,function(c,a){b&&(b+=",");b+=a+" "+c.duration+"s "+c.easing+" "+c.delay+"s"});return b}function k(){k.superclass.constructor.apply(this,arguments)}var i=h("dom"),m=h("event/dom"),q=h("./base"),l=g.Features,n=l.getTransitionPrefix(),r=/([A-Z]|^ms)/g,o=n?n.toLowerCase()+"TransitionEnd":"transitionend",j=l.getTransitionProperty();g.extend(k,q,{doStart:function(){var c=this,b=c.node,d=b.style,a=c._propsData,
f=d[j],e,h={};if(e=a.transform)delete a.transform,a[l.getTransformProperty().replace(r,"-$1").toLowerCase()]=e;g.each(a,function(a,e){var d=a.value,f=i.css(b,e);"number"===typeof d&&(f=parseFloat(f));f===d&&setTimeout(function(){c._onTransitionEnd({originalEvent:{propertyName:e}})},0);h[e]=d});-1!==f.indexOf("none")?f="":f&&(f+=",");d[j]=f+p(a);m.on(b,o,c._onTransitionEnd,c);i.css(b,h)},beforeResume:function(){var c=this._propsData,b=g.merge(c),d=this._runTime/1E3;g.each(b,function(a,b){var e=d;a.delay>=
e?a.delay-=e:(e-=a.delay,a.delay=0,a.duration>=e?a.duration-=e:delete c[b])})},_onTransitionEnd:function(c){var c=c.originalEvent,b=1,d=this._propsData;d[c.propertyName]&&(d[c.propertyName].pos=1,g.each(d,function(a){if(1!==a.pos)return b=0,!1}),b&&this.stop(!0))},doStop:function(c){var b=this.node,d=b.style,a=this._propsData,f=[],e={};m.detach(b,o,this._onTransitionEnd,this);g.each(a,function(a,d){c||(e[d]=i.css(b,d));f.push(d)});a=g.trim(d[j].replace(RegExp("(^|,)\\s*(?:"+f.join("|")+")\\s+[^,]+",
"gi"),"$1")).replace(/^,|,,|,$/g,"")||"none";d[j]=a;i.css(b,e)}});return k});
