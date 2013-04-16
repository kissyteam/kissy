/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:14
*/
KISSY.add("cookie",function(c){function f(b){return"string"==typeof b&&""!==b}var h=c.Env.host.document,j=encodeURIComponent,g=c.urlDecode;return c.Cookie={get:function(b){var a,d;if(f(b)&&(d=(""+h.cookie).match(RegExp("(?:^| )"+b+"(?:(?:=([^;]*))|;|$)"))))a=d[1]?g(d[1]):"";return a},set:function(b,a,d,i,c,g){var a=""+j(a),e=d;"number"===typeof e&&(e=new Date,e.setTime(e.getTime()+864E5*d));e instanceof Date&&(a+="; expires="+e.toUTCString());f(i)&&(a+="; domain="+i);f(c)&&(a+="; path="+c);g&&(a+=
"; secure");h.cookie=b+"="+a},remove:function(b,a,d,c){this.set(b,"",-1,a,d,c)}}});
