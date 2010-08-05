/*
Copyright 2010, KISSY UI Library v1.1.1dev
MIT Licensed
build time: ${build.time}
*/
KISSY.add("ua-extra",function(f){var d=f.UA,a=navigator.userAgent,b,c={},e=d._numberify;if(a.match(/360SE/))c.se360=3;else if(a.match(/Maxthon/)&&(b=window.external))try{c.maxthon=e(b.max_version)}catch(g){c.maxthon=0.1}else if(b=a.match(/TencentTraveler\s([\d.]*)/))c.tt=b[1]?e(b[1]):0.1;else if(a.match(/TheWorld/))c.theworld=3;else if(b=a.match(/SE\s([\d.]*)/))c.sougou=b[1]?e(b[1]):0.1;else if(a=d.ie)c.rawie=a<8&&document.documentMode?8:a;f.mix(d,c)});
