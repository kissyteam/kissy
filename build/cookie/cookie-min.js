/*
Copyright 2010, KISSY UI Library v1.0.8
MIT Licensed
build: 871 Jul 19 08:51
*/
KISSY.add("cookie",function(i){function f(a){return typeof a==="string"&&a!==""}var g=document,j=encodeURIComponent,k=decodeURIComponent;i.Cookie={get:function(a){var b;if(f(a))if(a=g.cookie.match("(?:^| )"+a+"(?:(?:=([^;]*))|;|$)"))b=a[1]?k(a[1]):"";return b},set:function(a,b,d,e,h,l){b=j(b);var c=d;if(typeof c==="number"){c=new Date;c.setTime(c.getTime()+d*864E5)}if(c instanceof Date)b+="; expires="+c.toUTCString();if(f(e))b+="; domain="+e;if(f(h))b+="; path="+h;if(l)b+="; secure";g.cookie=a+"="+
b},remove:function(a,b,d,e){this.set(a,"",0,b,d,e)}}});
