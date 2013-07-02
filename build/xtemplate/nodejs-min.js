/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 2 15:40
*/
KISSY.add("xtemplate/nodejs",function(c,g){function h(a){var b=a.cacheFile,d=a.extname;return function(a){if(b&&f[a])return f[a];var e=new c.Loader.Module({name:a,type:d,runtime:c}),e=i.readFileSync((new c.Uri(e.getFullPath())).getPath(),{encoding:"utf-8"});b&&(f[a]=e);return e}}var i=require("fs"),f={};return function(a,b){b=c.merge(b,{cacheFile:1});b.extname=b.extname||"html";var d=h(b);b.name=a;b.loader=d;a=d(a);delete b.extname;return new g(a,b)}},{requires:["xtemplate"]});
