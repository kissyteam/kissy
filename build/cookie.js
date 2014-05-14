/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 14 22:15
*/
KISSY.add("cookie",["util"],function(c,f){function g(b){return"string"===typeof b&&""!==b}var j=f("util"),h=c.Env.host.document,k=encodeURIComponent,l=j.urlDecode;c.Cookie={get:function(b){var a,d;if(g(b)&&(d=(""+h.cookie).match(RegExp("(?:^| )"+b+"(?:(?:=([^;]*))|;|$)"))))a=d[1]?l(d[1]):"";return a},set:function(b,a,d,i,c,f){var a=""+k(a),e=d;"number"===typeof e&&(e=new Date,e.setTime(e.getTime()+864E5*d));e instanceof Date&&(a+="; expires="+e.toUTCString());g(i)&&(a+="; domain="+i);g(c)&&(a+="; path="+
c);f&&(a+="; secure");h.cookie=b+"="+a},remove:function(b,a,d,c){this.set(b,"",-1,a,d,c)}};return c.Cookie});
