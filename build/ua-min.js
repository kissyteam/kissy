/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Nov 28 02:51
*/
KISSY.add("ua",function(f,e){var b=f.Env.host,g=f.UA,c=b.navigator,c=c&&c.userAgent||"",i,a,d={se360:e,maxthon:e,tt:e,theworld:e,sougou:e},h=g._numberify;if(c.match(/360SE/))d[a="se360"]=3;else if(c.match(/Maxthon/)&&(i=b.external)){a="maxthon";try{d[a]=h(i.max_version)}catch(j){d[a]=0.1}}else if(b=c.match(/TencentTraveler\s([\d.]*)/))d[a="tt"]=b[1]?h(b[1]):0.1;else if(c.match(/TheWorld/))d[a="theworld"]=3;else if(b=c.match(/SE\s([\d.]*)/))d[a="sougou"]=b[1]?h(b[1]):0.1;a&&(d.shell=a);f.mix(g,d);
return g});
