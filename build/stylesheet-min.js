/*
Copyright 2012, KISSY UI Library v1.30rc
MIT Licensed
build time: Aug 7 22:26
*/
KISSY.add("stylesheet",function(m,i){function h(a){this.ownerNode=i.get(a);this.sheet=a=a.sheet||a.styleSheet;var e={};this.cssRules=e;var b=a&&"cssRules"in a?"cssRules":"rules";this.rulesName=b;var b=a[b],d,c,f,g;for(d=b.length-1;0<=d;d--)c=b[d],f=c.selectorText,(g=e[f])?(g.style.cssText+=";"+g.style.cssText,c=a,f=d,c.deleteRule?c.deleteRule(f):c.removeRule&&c.removeRule(f)):e[f]=c}function j(a,e){k.cssText=e||"";i.css(l,a);return k.cssText}h.prototype={constructor:h,enable:function(){this.sheet.disabled=
!1;return this},disable:function(){this.sheet.disabled=!0;return this},isEnabled:function(){return!this.sheet.disabled},set:function(a,e){var b=this.sheet,d=this.rulesName,c=this.cssRules,f=c[a],g=a.split(/\s*,\s*/);if(1<g.length){for(c=0;c<g.length-1;c++)this.set(g[c],e);return this}if(f)if(e=j(e,f.style.cssText))f.style.cssText=e;else{delete c[a];for(c=b[d].length-1;0<=c;c--)if(b[d][c]==f){d=c;b.deleteRule?b.deleteRule(d):b.removeRule&&b.removeRule(d);break}}else if(f=b[d].length,e=j(e))g=e,b.insertRule?
b.insertRule(a+" {"+g+"}",f):b.addRule&&b.addRule(a,g,f),c[a]=b[d][f];return this},get:function(a){var e,b,d=this.cssRules;if(a)return(a=d[a])?a.style.cssText:null;e=[];for(b in d)d.hasOwnProperty(b)&&(a=d[b],e.push(a.selectorText+" {"+a.style.cssText+"}"));return e.join("\n")}};var l=document.createElement("p"),k=l.style;return h},{requires:["dom"]});
