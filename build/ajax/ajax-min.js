/*
Copyright 2010, KISSY UI Library v1.0.8
MIT Licensed
build: 888 Jul 20 19:32
*/
KISSY.add("ajax",function(e){var f=document,g=f.createElement("script").readyState?function(a,b){a.onreadystatechange=function(){var c=a.readyState;if(c==="loaded"||c==="complete"){a.onreadystatechange=null;b.call(this)}}}:function(a,b){a.onload=b};e.Ajax={request:function(){e.error("not implemented")},getScript:function(a,b,c){var h=e.get("head")||f.documentElement,d=f.createElement("script");d.src=a;if(c)d.charset=c;d.async=true;e.isFunction(b)&&g(d,b);h.appendChild(d)}}});
