/*
Copyright 2010, KISSY UI Library v1.0.4
MIT Licensed
build: 504 Mar 28 17:00
*/
KISSY.add("kissy-ua",function(e){var c=navigator.userAgent,a,b={ie:0,gecko:0,firefox:0,opera:0,webkit:0,safari:0,chrome:0,mobile:""},d=function(f){var g=0;return parseFloat(f.replace(/\./g,function(){return g++===0?".":""}))};if((a=c.match(/AppleWebKit\/([\d.]*)/))&&a[1]){b.webkit=d(a[1]);if((a=c.match(/Chrome\/([\d.]*)/))&&a[1])b.chrome=d(a[1]);else if((a=c.match(/\/([\d.]*) Safari/))&&a[1])b.safari=d(a[1]);if(/ Mobile\//.test(c))b.mobile="Apple";else if(a=c.match(/NokiaN[^\/]*|Android \d\.\d|webOS\/\d\.\d/))b.mobile=
a[0]}else if((a=c.match(/Opera\/.* Version\/([\d.]*)/))&&a[1]){b.opera=d(a[1]);if(c.match(/Opera Mini[^;]*/))b.mobile=a[0]}else if((a=c.match(/MSIE\s([^;]*)/))&&a[1])b.ie=d(a[1]);else if(a=c.match(/Gecko/)){b.gecko=1;if((a=c.match(/rv:([\d.]*)/))&&a[1])b.gecko=d(a[1]);if((a=c.match(/Firefox\/([\d.]*)/))&&a[1])b.firefox=d(a[1])}e.UA=b});
