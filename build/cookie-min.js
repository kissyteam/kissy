/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Mar 23 12:19
*/
KISSY.add("cookie",function(d){var h=d.Env.host.document,i=encodeURIComponent,j=decodeURIComponent;return d.Cookie={get:function(b){var a;if(d.isString(b)&&b!=="")if(b=String(h.cookie).match(RegExp("(?:^| )"+b+"(?:(?:=([^;]*))|;|$)")))a=b[1]?j(b[1]):"";return a},set:function(b,a,f,e,g,k){a=String(i(a));var c=f;if(typeof c==="number"){c=new Date;c.setTime(c.getTime()+f*864E5)}if(c instanceof Date)a+="; expires="+c.toUTCString();if(d.isString(e)&&e!=="")a+="; domain="+e;if(d.isString(g)&&g!=="")a+=
"; path="+g;if(k)a+="; secure";h.cookie=b+"="+a},remove:function(b,a,f,e){this.set(b,"",-1,a,f,e)}}});
