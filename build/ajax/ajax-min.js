/*
Copyright 2010, KISSY UI Library v1.0.8
MIT Licensed
build: 846 Jul 11 00:09
*/
KISSY.add("ajax",function(f){var e=document,g=e.createElement("script").readyState?function(a,b){a.onreadystatechange=function(){var c=a.readyState;if(c==="loaded"||c==="complete"){a.onreadystatechange=null;b.call(this)}}}:function(a,b){a.onload=b};f.Ajax={request:function(){f.error("not implemented")},getScript:function(a,b,c){var h=e.getElementsByTagName("head")[0]||e.documentElement,d=e.createElement("script");d.src=a;if(c)d.charset=c;d.async=true;f.isFunction(b)&&g(d,b);h.appendChild(d)}}});
