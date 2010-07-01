/*
Copyright 2010, KISSY UI Library v1.0.8
MIT Licensed
build: 792 Jul 1 19:44
*/
KISSY.add("ajax",function(b){var c=document,g=b.UA;b.Ajax={request:function(){b.error("not implemented")},getScript:function(h,d,e){var i=c.getElementsByTagName("head")[0]||c.documentElement,a=c.createElement("script");a.src=h;if(e)a.charset=e;a.async=true;if(b.isFunction(d))if(g.ie)a.onreadystatechange=function(){var f=a.readyState;if(f==="loaded"||f==="complete"){a.onreadystatechange=null;d()}};else a.onload=d;i.appendChild(a)}}});
