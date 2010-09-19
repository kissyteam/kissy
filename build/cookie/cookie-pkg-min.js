/*
Copyright 2010, KISSY UI Library v1.1.5
MIT Licensed
build time: Sep 19 17:41
*/
KISSY.add("cookie",function(e){var h=document,i=encodeURIComponent,j=decodeURIComponent;e.Cookie={get:function(b){var a;if(e.isString(b)&&b!=="")if(b=h.cookie.match("(?:^| )"+b+"(?:(?:=([^;]*))|;|$)"))a=b[1]?j(b[1]):"";return a},set:function(b,a,f,d,g,k){a=i(a);var c=f;if(typeof c==="number"){c=new Date;c.setTime(c.getTime()+f*864E5)}if(c instanceof Date)a+="; expires="+c.toUTCString();if(e.isString(d)&&d!=="")a+="; domain="+d;if(e.isString(g)&&g!=="")a+="; path="+g;if(k)a+="; secure";h.cookie=b+
"="+a},remove:function(b,a,f,d){this.set(b,"",0,a,f,d)}}});
