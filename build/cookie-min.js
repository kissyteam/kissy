/*
Copyright 2011, KISSY UI Library v1.30dev
MIT Licensed
build time: Dec 31 15:15
*/
KISSY.add("cookie",function(f){var h=document,i=encodeURIComponent,j=decodeURIComponent;return{get:function(b){var a;if(f.isString(b)&&b!=="")if(b=String(h.cookie).match(RegExp("(?:^| )"+b+"(?:(?:=([^;]*))|;|$)")))a=b[1]?j(b[1]):"";return a},set:function(b,a,e,d,g,k){a=String(i(a));var c=e;if(typeof c==="number"){c=new Date;c.setTime(c.getTime()+e*864E5)}if(c instanceof Date)a+="; expires="+c.toUTCString();if(f.isString(d)&&d!=="")a+="; domain="+d;if(f.isString(g)&&g!=="")a+="; path="+g;if(k)a+="; secure";
h.cookie=b+"="+a},remove:function(b,a,e,d){this.set(b,"",-1,a,e,d)}}});
