/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:31
*/
KISSY.add("xtemplate/nodejs",["xtemplate"],function(d,g){function h(b){var a=b.cacheFile,c=b.extname;return function(b){if(a&&f[b])return f[b];var e=new d.Loader.Module({name:b,type:c,runtime:d}),e=i.readFileSync((new d.Uri(e.getFullPath())).getPath(),{encoding:"utf-8"});a&&(f[b]=e);return e}}var i=requireNode("fs"),j=g("xtemplate"),f={};return{loadFromModuleName:function(b,a){a=d.merge({cacheFile:1},a);a.extname=a.extname||"html";var c=h(a);a.name=b;a.loader=c;c=c(b);delete a.extname;return new j(c,
a)}}});
