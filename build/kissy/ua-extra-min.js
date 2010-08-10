/*
Copyright 2010, KISSY UI Library v1.1.2dev
MIT Licensed
build time: ${build.time}
*/
KISSY.add("ua-extra",function(g){var e=g.UA,c=navigator.userAgent,d,a,b={},f=e._numberify;if(c.match(/360SE/))b[a="se360"]=3;else if(c.match(/Maxthon/)&&(d=window.external)){a="maxthon";try{b[a]=f(d.max_version)}catch(h){b[a]=0.1}}else if(d=c.match(/TencentTraveler\s([\d.]*)/))b[a="tt"]=d[1]?f(d[1]):0.1;else if(c.match(/TheWorld/))b[a="theworld"]=3;else if(d=c.match(/SE\s([\d.]*)/))b[a="sougou"]=d[1]?f(d[1]):0.1;else if(c=e.ie)b.rawie=c<8&&document.documentMode?8:c;a&&(b.shell=a);g.mix(e,b)});
