/*
Copyright 2010, KISSY UI Library v0.9dev
MIT Licensed
build: 444 Jan 23 23:34
*/
KISSY.add("dom-selector",function(j,s){function t(a){if(a===s)a=g;else if(typeof a===o&&p.test(a))a=l(a.slice(1));else if(a&&a.nodeType!==1&&a.nodeType!==9)a=null;return a}function l(a){return g.getElementById(a)}function q(a,c){return a.getElementsByTagName(c)}function m(a,c,b){c=b.getElementsByTagName(c||k);b=[];var d=0,f=0,e=c.length,h,r;for(a=i+a+i;d<e;++d){h=c[d];if((r=h.className)&&(i+r+i).indexOf(a)>-1)b[f++]=h}return b}function n(a){return Array.prototype.slice.call(a)}function u(a){return j.mix(a,
j.Dom)}var g=document,o="string",i=" ",k="*",p=/^#[\w-]+$/,v=/^(?:#([\w-]+))?\s*([\w-]+|\*)?\.?([\w-]+)?$/;j.query=function(a,c){var b,d=[],f,e;if(typeof a===o){a=j.trim(a);if(p.test(a)){if(a=l(a.slice(1)))d=[a]}else if(b=v.exec(a)){f=b[1];e=b[2];b=b[3];if(c=f?l(f):t(c))if(b){if(!f||a.indexOf(i)!==-1)d=m(b,e,c)}else if(e)d=q(c,e)}}else if(a&&a.nodeType)d=[a];else if(a&&a.item)d=a;return u(d.item?n(d):d)};(function(){var a=g.createElement("div");a.appendChild(g.createComment(""));if(a.getElementsByTagName(k).length>
0)q=function(c,b){c=c.getElementsByTagName(b);if(b===k){b=[];for(var d=0,f=0,e;e=c[d++];)if(e.nodeType===1)b[f++]=e;c=b}return c}})();if(g.getElementsByClassName)m=function(a,c,b){b=a=b.getElementsByClassName(a);var d=0,f=0,e=a.length,h;if(c&&c!==k){b=[];for(c=c.toUpperCase();d<e;++d){h=a[d];if(h.tagName===c)b[f++]=h}}return b};else if(g.querySelectorAll)m=function(a,c,b){return b.querySelectorAll((c?c:"")+"."+a)};try{n(g.documentElement.childNodes)}catch(w){n=function(a){for(var c=[],b=0,d=a.length;b<
d;++b)c[b]=a[b];return c}}});
