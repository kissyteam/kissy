/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 13:53
*/
KISSY.add("cookie",["util"],function(d,f,m,j){function g(b){return"string"===typeof b&&""!==b}var d=f("util"),h=document,k=encodeURIComponent,l=d.urlDecode;j.exports={get:function(b){var a,c;if(g(b)&&(c=(""+h.cookie).match(RegExp("(?:^| )"+b+"(?:(?:=([^;]*))|;|$)"))))a=c[1]?l(c[1]):"";return a},set:function(b,a,c,i,d,f){var a=""+k(a),e=c;"number"===typeof e&&(e=new Date,e.setTime(e.getTime()+864E5*c));e instanceof Date&&(a+="; expires="+e.toUTCString());g(i)&&(a+="; domain="+i);g(d)&&(a+="; path="+
d);f&&(a+="; secure");h.cookie=b+"="+a},remove:function(b,a,c,d){this.set(b,"",-1,a,c,d)}}});
