/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 9 13:52
*/
KISSY.add("anim/transition",["dom","./base"],function(f,k){function n(d){var c="";f.each(d,function(a,b){c&&(c+=",");c+=b+" "+a.duration+"s "+a.easing+" "+a.delay+"s"});return c}function o(d){return d.replace(/[A-Z]/g,function(c){return"-"+c.toLowerCase()})}function h(d,c,a,b,g){if(!(this instanceof h))return new h(d,c,a,b,g);h.superclass.constructor.apply(this,arguments)}var i=k("dom"),l=k("./base"),m=f.Feature.getCssVendorInfo,j=m("transition").propertyName,p={ease:1,linear:1,"ease-in":1,"ease-out":1,
"ease-in-out":1};f.extend(h,l,{prepareFx:function(){var d=this._propsData,c={},a,b;for(b in d)a=d[b],"string"===typeof a.easing?!f.startsWith(a.easing,"cubic-bezier")&&!p[a.easing]&&(a.easing="linear"):a.easing="linear",a=m(b),c[o(a.propertyName)]=d[b];this._propsData=c},doStart:function(){var d=this,c=d.node,a=c.style,b=d._propsData,g=a[j],e=0,h={};f.each(b,function(b,a){var d=b.value;i.css(c,a,i.css(c,a));h[a]=d;e=Math.max(b.duration+b.delay,e)});-1!==g.indexOf("none")?g="":g&&(g+=",");a[j]=g+n(b);
setTimeout(function(){i.css(c,h)},0);d._transitionEndTimer=setTimeout(function(){d.stop(!0)},1E3*e)},beforeResume:function(){var d=this._propsData,c=f.merge(d),a=this._runTime/1E3;f.each(c,function(b,c){var e=a;b.delay>=e?b.delay-=e:(e-=b.delay,b.delay=0,b.duration>=e?b.duration-=e:delete d[c])})},doStop:function(d){var c=this.node,a=c.style,b=this._propsData,g=[],e={};this._transitionEndTimer&&(clearTimeout(this._transitionEndTimer),this._transitionEndTimer=null);f.each(b,function(b,a){d||(e[a]=
i.css(c,a));g.push(a)});b=f.trim(a[j].replace(RegExp("(^|,)\\s*(?:"+g.join("|")+")\\s+[^,]+","gi"),"$1")).replace(/^,|,,|,$/g,"")||"none";a[j]=b;i.css(c,e)}});f.mix(h,l.Statics);return f.Anim=h});
