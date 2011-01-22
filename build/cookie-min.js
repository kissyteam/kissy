/*
Copyright 2011, KISSY UI Library v1.1.7dev
MIT Licensed
build time: ${build.time}
*/
KISSY.add("cookie/base",function(g){function d(a){return g.isString(a)&&a!==""}var h=document,j=encodeURIComponent,k=decodeURIComponent;return{get:function(a){var b;if(d(a))if(a=String(h.cookie).match(RegExp("(?:^| )"+a+"(?:(?:=([^;]*))|;|$)")))b=a[1]?k(a[1]):"";return b},set:function(a,b,e,f,i,l){b=String(j(b));var c=e;if(typeof c==="number"){c=new Date;c.setTime(c.getTime()+e*864E5)}if(c instanceof Date)b+="; expires="+c.toUTCString();if(d(f))b+="; domain="+f;if(d(i))b+="; path="+i;if(l)b+="; secure";
h.cookie=a+"="+b},remove:function(a,b,e,f){this.set(a,"",0,b,e,f)}}});KISSY.add("cookie",function(g,d){return d},{requires:["cookie/base"]});
