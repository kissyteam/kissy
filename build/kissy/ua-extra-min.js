/*
Copyright 2010, KISSY UI Library v1.1.2dev
MIT Licensed
build time: ${build.time}
*/
KISSY.add("ua-extra",function(f){var g=f.UA,d=navigator.userAgent,b,a,c={},e=g._numberify;if(d.match(/360SE/))c[a="se360"]=3;else if(d.match(/Maxthon/)&&(b=window.external)){a="maxthon";try{c[a]=e(b.max_version)}catch(h){c[a]=0.1}}else if(b=d.match(/TencentTraveler\s([\d.]*)/))c[a="tt"]=b[1]?e(b[1]):0.1;else if(d.match(/TheWorld/))c[a="theworld"]=3;else if(b=d.match(/SE\s([\d.]*)/))c[a="sougou"]=b[1]?e(b[1]):0.1;a&&(c.shell=a);f.mix(g,c)});
