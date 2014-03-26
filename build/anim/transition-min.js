/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 26 13:00
*/
KISSY.add("anim/transition",["dom","./base"],function(g,k){function n(d){var c="";g.each(d,function(a,b){c&&(c+=",");c+=b+" "+a.duration+"s "+a.easing+" "+a.delay+"s"});return c}function o(d){return d.replace(/[A-Z]/g,function(c){return"-"+c.toLowerCase()})}function h(d,c,a,b,f){if(!(this instanceof h))return new h(d,c,a,b,f);h.superclass.constructor.apply(this,arguments)}var i=k("dom"),l=k("./base"),m=g.Feature.getCssVendorInfo,j=m("transition").propertyName,p={ease:1,linear:1,"ease-in":1,"ease-out":1,
"ease-in-out":1};g.extend(h,l,{prepareFx:function(){var d=this._propsData,c={},a,b;for(b in d)a=d[b],"string"===typeof a.easing?!g.startsWith(a.easing,"cubic-bezier")&&!p[a.easing]&&(a.easing="ease-in"):a.easing="ease-in",a=m(b),c[o(a.propertyName)]=d[b];this._propsData=c},doStart:function(){var d=this,c=d.node,a=c.style,b=d._propsData,f=a[j],e=0,h={};g.each(b,function(b,a){var d=b.value;i.css(c,a,i.css(c,a));h[a]=d;e=Math.max(b.duration+b.delay,e)});-1!==f.indexOf("none")?f="":f&&(f+=",");a[j]=f+
n(b);setTimeout(function(){i.css(c,h)},0);d._transitionEndTimer=setTimeout(function(){d.stop(!0)},1E3*e)},beforeResume:function(){var d=this._propsData,c=g.merge(d),a=this._runTime/1E3;g.each(c,function(b,c){var e=a;b.delay>=e?b.delay-=e:(e-=b.delay,b.delay=0,b.duration>=e?b.duration-=e:delete d[c])})},doStop:function(d){var c=this.node,a=c.style,b=this._propsData,f=[],e={};this._transitionEndTimer&&(clearTimeout(this._transitionEndTimer),this._transitionEndTimer=null);g.each(b,function(b,a){d||(e[a]=
i.css(c,a));f.push(a)});b=g.trim(a[j].replace(RegExp("(^|,)\\s*(?:"+f.join("|")+")\\s+[^,]+","gi"),"$1")).replace(/^,|,,|,$/g,"")||"none";a[j]=b;i.css(c,e)}});g.mix(h,l.Statics);return h});
