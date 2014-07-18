/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 13:55
*/
KISSY.add("dom/class-list",["util","dom/base"],function(i,j,l,k){var g=j("util"),i=j("dom/base"),h=/[\n\t\r]/g;k.exports=g.mix(i,{_hasClass:function(f,d){var a=f.className,e,b;if(a){a=(" "+a+" ").replace(h," ");b=0;for(e=d.length;b<e;b++)if(0>a.indexOf(" "+d[b]+" "))return!1;return!0}return!1},_addClass:function(f,d){var a=f.className,e,b=d.length,c;if(a){e=(" "+a+" ").replace(h," ");for(c=0;c<b;c++)0>e.indexOf(" "+d[c]+" ")&&(a+=" "+d[c]);a=g.trim(a)}else a=d.join(" ");f.className=a},_removeClass:function(f,
d){var a=f.className,e=d.length,b,c;if(a&&e){a=(" "+a+" ").replace(h," ");for(b=0;b<e;b++)for(c=" "+d[b]+" ";0<=a.indexOf(c);)a=a.replace(c," ");f.className=g.trim(a)}},_toggleClass:function(f,d,a){var e,b,c,g=[],h=[],i=d.length;for(e=0;e<i;e++)b=d[e],c=(c=this._hasClass(f,[b]))?!0!==a&&"remove":!1!==a&&"add","remove"===c?g.push(b):"add"===c&&h.push(b);h.length&&this._addClass(f,h);g.length&&this._removeClass(f,g)}})});
