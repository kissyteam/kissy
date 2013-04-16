/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:23
*/
KISSY.add("stylesheet",function(l,j){function h(a){a.el&&(a=a.el);a=this.el=j.get(a);this.sheet=a=a.sheet||a.styleSheet;var d={};this.cssRules=d;var b=a&&"cssRules"in a?"cssRules":"rules";this.rulesName=b;var b=a[b],e,c,f,g;for(e=b.length-1;0<=e;e--)c=b[e],f=c.selectorText,(g=d[f])?(g.style.cssText+=";"+g.style.cssText,c=a,f=e,c.deleteRule?c.deleteRule(f):c.removeRule&&c.removeRule(f)):d[f]=c}function k(a,d){i.style.cssText=d||"";j.css(i,a);return i.style.cssText}h.prototype={constructor:h,enable:function(){this.sheet.disabled=
!1;return this},disable:function(){this.sheet.disabled=!0;return this},isEnabled:function(){return!this.sheet.disabled},set:function(a,d){var b=this.sheet,e=this.rulesName,c=this.cssRules,f=c[a],g=a.split(/\s*,\s*/);if(1<g.length){for(c=0;c<g.length-1;c++)this.set(g[c],d);return this}if(f)if(d=k(d,f.style.cssText))f.style.cssText=d;else{delete c[a];for(c=b[e].length-1;0<=c;c--)if(b[e][c]==f){e=c;b.deleteRule?b.deleteRule(e):b.removeRule&&b.removeRule(e);break}}else if(f=b[e].length,d=k(d))g=d,b.insertRule?
b.insertRule(a+" {"+g+"}",f):b.addRule&&b.addRule(a,g,f),c[a]=b[e][f];return this},get:function(a){var d,b,e=this.cssRules;if(a)return(a=e[a])?a.style.cssText:null;d=[];for(b in e)a=e[b],d.push(a.selectorText+" {"+a.style.cssText+"}");return d.join("\n")}};var i=document.createElement("p");return h},{requires:["dom"]});
