/*
Copyright 2010, KISSY UI Library v1.0.3
MIT Licensed
build: 469 Mar 9 17:10
*/
KISSY.add("dom-base",function(d,e){var h=document.documentElement.textContent!==e?"textContent":"innerText";d.Dom={query:d.query,get:d.get,attr:function(a,b,c){if(a&&a.getAttribute){if(c===e)return a.getAttribute(attr)||"";a.setAttribute(attr,c)}},removeAttr:function(a,b){a&a.removeAttribute&&a.removeAttribute(b)},hasClass:function(a,b){if(!b||!a.className)return false;return(" "+a.className+" ").indexOf(" "+b+" ")>-1},addClass:function(a,b){if(b)f(a,b)||(a.className+=" "+b)},removeClass:function(a,
b){if(f(a,b)){a.className=(" "+a.className+" ").replace(" "+b+" "," ");f(a,b)&&g(a,b)}},replaceClass:function(a,b,c){g(a,b);i(a,c)},toggleClass:function(a,b,c){(c!==e?c:!f(a,b))?i(a,b):g(a,b)},css:function(){},text:function(a,b){if(b===e)return(a||{})[h]||"";if(a)a[h]=b},html:function(){},val:function(){},create:function(){}};var f=d.Dom.hasClass,i=d.Dom.addClass,g=d.Dom.removeClass});
