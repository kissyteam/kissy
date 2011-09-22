/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: Sep 22 13:54
*/
KISSY.add("cookie/base",function(e){var f=document,i=encodeURIComponent,j=decodeURIComponent;return{get:function(b){var a;if(e.isString(b)&&b!=="")if(b=String(f.cookie).match(RegExp("(?:^| )"+b+"(?:(?:=([^;]*))|;|$)")))a=b[1]?j(b[1]):"";return a},set:function(b,a,g,d,h,k){a=String(i(a));var c=g;if(typeof c==="number"){c=new Date;c.setTime(c.getTime()+g*864E5)}if(c instanceof Date)a+="; expires="+c.toUTCString();if(e.isString(d)&&d!=="")a+="; domain="+d;if(e.isString(h)&&h!=="")a+="; path="+h;if(k)a+=
"; secure";f.cookie=b+"="+a},remove:function(b,a,g,d){this.set(b,"",-1,a,g,d)}}});KISSY.add("cookie",function(e,f){return f},{requires:["cookie/base"]});
