/*
Copyright 2010, KISSY UI Library v1.1.2dev
MIT Licensed
build time: ${build.time}
*/
KISSY.add("cookie",function(g){function f(a){return g.isString(a)&&a!==""}var h=document,j=encodeURIComponent,k=decodeURIComponent;g.Cookie={get:function(a){var b;if(f(a))if(a=h.cookie.match("(?:^| )"+a+"(?:(?:=([^;]*))|;|$)"))b=a[1]?k(a[1]):"";return b},set:function(a,b,d,e,i,l){b=j(b);var c=d;if(typeof c==="number"){c=new Date;c.setTime(c.getTime()+d*864E5)}if(c instanceof Date)b+="; expires="+c.toUTCString();if(f(e))b+="; domain="+e;if(f(i))b+="; path="+i;if(l)b+="; secure";h.cookie=a+"="+b},remove:function(a,
b,d,e){this.set(a,"",0,b,d,e)}}});
