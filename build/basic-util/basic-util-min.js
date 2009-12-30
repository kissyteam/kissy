/*
Copyright (c) 2009, Kissy UI Library. All rights reserved.
MIT Licensed.
http://kissy.googlecode.com/

Date: 2009-12-30 13:09:30
Revision: 381
*/
KISSY.add("basic-util",function(b){var e=window,d=document,c=decodeURIComponent,a=function(f){return typeof(f)!=="string"?f:d.getElementById(f)};b.BasicUtil={get:a,getElementsByClassName:function(o,f,h){var j=[],m=(a(h)||d).getElementsByTagName(f||"*"),n=new RegExp("(^| )"+o+"( |$)","i");for(var k=0,g=m.length;k<g;k++){if(n.test(m[k].className)){j.push(m[k])}}return j},hasClass:function(g,f){g=a(g);if(!f||!g.className){return false}return(" "+g.className+" ").indexOf(" "+f+" ")>-1},addClass:function(g,f){if(!f){return}g=a(g);if(this.hasClass(g,f)){return}g.className+=" "+f},removeClass:function(g,f){g=a(g);if(!this.hasClass(g,f)){return}g.className=(" "+g.className+" ").replace(" "+f+" "," ");if(this.hasClass(g,f)){this.removeClass(g,f)}},addEvent:function(){if(e.addEventListener){return function(i,h,g,f){a(i).addEventListener(h,g,!!f)}}else{if(e.attachEvent){return function(h,g,f){a(h).attachEvent("on"+g,function(){f.apply(h)})}}}}(),removeEvent:function(){if(e.removeEventListener){return function(i,h,g,f){i.removeEventListener(h,g,!!f)}}else{if(e.detachEvent){return function(h,g,f){h.detachEvent("on"+g,f)}}}}(),getCookie:function(g){var f=d.cookie.match("(?:^|;)\\s*"+g+"=([^;]*)");return(f&&f[1])?c(f[1]):""},trim:function(f){return f.replace(/^\s+|\s+$/g,"")},parseQueryParams:function(n){var m={},g=n.split("&"),f,o,h,q;for(var j=0,l=g.length;j<l;++j){f=g[j];o=f.indexOf("=");h=f.slice(0,o);q=f.slice(o+1);m[c(h)]=c(q)}return m},pickDomain:function(h,i){i=i||location.hostname;var g=i.split("."),f=g.length;if(f<=2){return i}h=h||1;if(h>f-2){h=f-2}return g.slice(h).join(".")}}});
