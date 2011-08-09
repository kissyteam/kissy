/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: Aug 9 18:39
*/
KISSY.add("ua/base",function(){var d=navigator.userAgent,e="",f="",a,b={},c=function(g){var h=0;return parseFloat(g.replace(/\./g,function(){return h++===0?".":""}))};if((a=d.match(/AppleWebKit\/([\d.]*)/))&&a[1]){b[e="webkit"]=c(a[1]);if((a=d.match(/Chrome\/([\d.]*)/))&&a[1])b[f="chrome"]=c(a[1]);else if((a=d.match(/\/([\d.]*) Safari/))&&a[1])b[f="safari"]=c(a[1]);if(/ Mobile\//.test(d))b.mobile="apple";else if(a=d.match(/NokiaN[^\/]*|Android \d\.\d|webOS\/\d\.\d/))b.mobile=a[0].toLowerCase()}else if((a=
d.match(/Presto\/([\d.]*)/))&&a[1]){b[e="presto"]=c(a[1]);if((a=d.match(/Opera\/([\d.]*)/))&&a[1]){b[f="opera"]=c(a[1]);if((a=d.match(/Opera\/.* Version\/([\d.]*)/))&&a[1])b[f]=c(a[1]);if((a=d.match(/Opera Mini[^;]*/))&&a)b.mobile=a[0].toLowerCase();else if((a=d.match(/Opera Mobi[^;]*/))&&a)b.mobile=a[0]}}else if((a=d.match(/MSIE\s([^;]*)/))&&a[1]){b[e="trident"]=0.1;b[f="ie"]=c(a[1]);if((a=d.match(/Trident\/([\d.]*)/))&&a[1])b[e]=c(a[1])}else if(a=d.match(/Gecko/)){b[e="gecko"]=0.1;if((a=d.match(/rv:([\d.]*)/))&&
a[1])b[e]=c(a[1]);if((a=d.match(/Firefox\/([\d.]*)/))&&a[1])b[f="firefox"]=c(a[1])}b.core=e;b.shell=f;b._numberify=c;return b});
KISSY.add("ua/extra",function(d,e){var f=navigator.userAgent,a,b,c={},g=e._numberify;if(f.match(/360SE/))c[b="se360"]=3;else if(f.match(/Maxthon/)&&(a=window.external)){b="maxthon";try{c[b]=g(a.max_version)}catch(h){c[b]=0.1}}else if(a=f.match(/TencentTraveler\s([\d.]*)/))c[b="tt"]=a[1]?g(a[1]):0.1;else if(f.match(/TheWorld/))c[b="theworld"]=3;else if(a=f.match(/SE\s([\d.]*)/))c[b="sougou"]=a[1]?g(a[1]):0.1;b&&(c.shell=b);d.mix(e,c);return e},{requires:["ua/base"]});
KISSY.add("ua",function(d,e){return e},{requires:["ua/extra"]});
