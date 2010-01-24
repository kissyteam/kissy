/*
Copyright 2010, KISSY UI Library v0.9dev
MIT Licensed
build: 447 Jan 24 22:19
*/
KISSY.add("dom-selector",function(i,s){function t(a,c){var b,d=[],f,e;if(typeof a===o){a=i.trim(a);if(p.test(a)){if(a=l(a.slice(1)))d=[a]}else if(b=u.exec(a)){f=b[1];e=b[2];b=b[3];if(c=f?l(f):v(c))if(b){if(!f||a.indexOf(j)!==-1)d=m(b,e,c)}else if(e)d=q(c,e)}}else if(a&&a.nodeType)d=[a];else if(a&&a.item)d=a;return w(d.item?n(d):d)}function v(a){if(a===s)a=g;else if(typeof a===o&&p.test(a))a=l(a.slice(1));else if(a&&a.nodeType!==1&&a.nodeType!==9)a=null;return a}function l(a){return g.getElementById(a)}
function q(a,c){return a.getElementsByTagName(c)}function m(a,c,b){c=b.getElementsByTagName(c||k);b=[];var d=0,f=0,e=c.length,h,r;for(a=j+a+j;d<e;++d){h=c[d];if((r=h.className)&&(j+r+j).indexOf(a)>-1)b[f++]=h}return b}function n(a){return Array.prototype.slice.call(a)}function w(a){return i.mix(a,i.Dom)}var g=document,o="string",j=" ",k="*",p=/^#[\w-]+$/,u=/^(?:#([\w-]+))?\s*([\w-]+|\*)?\.?([\w-]+)?$/;(function(){var a=g.createElement("div");a.appendChild(g.createComment(""));if(a.getElementsByTagName(k).length>
0)q=function(c,b){c=c.getElementsByTagName(b);if(b===k){b=[];for(var d=0,f=0,e;e=c[d++];)if(e.nodeType===1)b[f++]=e;c=b}return c}})();if(g.getElementsByClassName)m=function(a,c,b){b=a=b.getElementsByClassName(a);var d=0,f=0,e=a.length,h;if(c&&c!==k){b=[];for(c=c.toUpperCase();d<e;++d){h=a[d];if(h.tagName===c)b[f++]=h}}return b};else if(g.querySelectorAll)m=function(a,c,b){return b.querySelectorAll((c?c:"")+"."+a)};try{n(g.documentElement.childNodes)}catch(x){n=function(a){for(var c=[],b=0,d=a.length;b<
d;++b)c[b]=a[b];return c}}i.query=i.Dom.query=t});
