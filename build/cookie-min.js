/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:17
*/
KISSY.add("cookie",[],function(b){function f(c){return"string"===typeof c&&""!==c}var h=b.Env.host.document,j=encodeURIComponent,g=b.urlDecode;b.Cookie={get:function(c){var a,d;if(f(c)&&(d=(""+h.cookie).match(RegExp("(?:^| )"+c+"(?:(?:=([^;]*))|;|$)"))))a=d[1]?g(d[1]):"";return a},set:function(c,a,d,b,i,g){var a=""+j(a),e=d;"number"===typeof e&&(e=new Date,e.setTime(e.getTime()+864E5*d));e instanceof Date&&(a+="; expires="+e.toUTCString());f(b)&&(a+="; domain="+b);f(i)&&(a+="; path="+i);g&&(a+="; secure");
h.cookie=c+"="+a},remove:function(c,a,d,b){this.set(c,"",-1,a,d,b)}};return b.Cookie});
