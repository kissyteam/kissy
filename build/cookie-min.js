/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Aug 20 15:07
*/
KISSY.add("cookie",function(c){var i=c.Env.host.document,j=encodeURIComponent,f=decodeURIComponent;return c.Cookie={get:function(d){var a,b;if(c.isString(d)&&""!==d&&(b=(""+i.cookie).match(RegExp("(?:^| )"+d+"(?:(?:=([^;]*))|;|$)"))))a=b[1]?f(b[1]):"";return a},set:function(d,a,b,g,h,f){var a=""+j(a),e=b;"number"===typeof e&&(e=new Date,e.setTime(e.getTime()+864E5*b));e instanceof Date&&(a+="; expires="+e.toUTCString());c.isString(g)&&""!==g&&(a+="; domain="+g);c.isString(h)&&""!==h&&(a+="; path="+
h);f&&(a+="; secure");i.cookie=d+"="+a},remove:function(d,a,b,c){this.set(d,"",-1,a,b,c)}}});
