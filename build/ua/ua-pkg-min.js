/*
Copyright 2010, KISSY UI Library v1.1.5
MIT Licensed
build time: Sep 19 17:41
*/
KISSY.add("ua",function(g){var c=navigator.userAgent,f="",d="",a,b={},e=function(h){var i=0;return parseFloat(h.replace(/\./g,function(){return i++===0?".":""}))};if((a=c.match(/AppleWebKit\/([\d.]*)/))&&a[1]){b[f="webkit"]=e(a[1]);if((a=c.match(/Chrome\/([\d.]*)/))&&a[1])b[d="chrome"]=e(a[1]);else if((a=c.match(/\/([\d.]*) Safari/))&&a[1])b[d="safari"]=e(a[1]);if(/ Mobile\//.test(c))b.mobile="apple";else if(a=c.match(/NokiaN[^\/]*|Android \d\.\d|webOS\/\d\.\d/))b.mobile=a[0].toLowerCase()}else if((a=
c.match(/Presto\/([\d.]*)/))&&a[1]){b[f="presto"]=e(a[1]);if((a=c.match(/Opera\/([\d.]*)/))&&a[1]){b[d="opera"]=e(a[1]);if((a=c.match(/Opera\/.* Version\/([\d.]*)/))&&a[1])b[d]=e(a[1]);if((a=c.match(/Opera Mini[^;]*/))&&a)b.mobile=a[0].toLowerCase();else if((a=c.match(/Opera Mobi[^;]*/))&&a)b.mobile=a[0]}}else if((a=c.match(/MSIE\s([^;]*)/))&&a[1]){b[f="trident"]=0.1;b[d="ie"]=e(a[1]);if((a=c.match(/Trident\/([\d.]*)/))&&a[1])b[f]=e(a[1])}else if(a=c.match(/Gecko/)){b[f="gecko"]=0.1;if((a=c.match(/rv:([\d.]*)/))&&
a[1])b[f]=e(a[1]);if((a=c.match(/Firefox\/([\d.]*)/))&&a[1])b[d="firefox"]=e(a[1])}b.core=f;b.shell=d;b._numberify=e;g.UA=b});
KISSY.add("ua-extra",function(g){var c=g.UA,f=navigator.userAgent,d,a,b={},e=c._numberify;if(f.match(/360SE/))b[a="se360"]=3;else if(f.match(/Maxthon/)&&(d=window.external)){a="maxthon";try{b[a]=e(d.max_version)}catch(h){b[a]=0.1}}else if(d=f.match(/TencentTraveler\s([\d.]*)/))b[a="tt"]=d[1]?e(d[1]):0.1;else if(f.match(/TheWorld/))b[a="theworld"]=3;else if(d=f.match(/SE\s([\d.]*)/))b[a="sougou"]=d[1]?e(d[1]):0.1;a&&(b.shell=a);g.mix(c,b)});
