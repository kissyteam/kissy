/*
Copyright 2010, KISSY UI Library v1.0.5
MIT Licensed
build: 516 Apr 2 09:07
*/
KISSY.add("cookie",function(i){function d(a){return typeof a==="string"&&a!==""}var e=document,j=encodeURIComponent,k=decodeURIComponent;i.Cookie={get:function(a){var b;if(d(a))if(a=e.cookie.match("(?:^| )"+a+"(?:(?:=([^;]*))|;|$)"))b=a[1]?k(a[1]):"";return b},set:function(a,b,f,g,h,l){b=j(b);var c=f;if(typeof c==="number"){c=new Date;c.setTime(c.getTime()+f*864E5)}if(c instanceof Date)b+="; expires="+c.toUTCString();if(d(g))b+="; domain="+g;if(d(h))b+="; path="+h;if(l)b+="; secure";e.cookie=a+"="+
b},remove:function(a){this.set(a,"",0)}}});
