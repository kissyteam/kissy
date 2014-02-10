/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Feb 10 20:39
*/
KISSY.add("xtemplate/nodejs",["xtemplate"],function(e,g){function h(b){var a=b.cache,c=b.extname;return function(b){if(a&&f[b])return f[b];var d=new e.Loader.Module({name:b,type:c,runtime:e}),d=i.readFileSync((new e.Uri(d.getPath())).getPath(),{encoding:"utf-8"});a&&(f[b]=d);return d}}var i=requireNode("fs"),j=g("xtemplate"),f={};return{loadFromModuleName:function(b,a){a=a||{};a.extname=a.extname||"html";var c=h(a);a.name=b;a.loader=c;c=c(b);delete a.extname;return new j(c,a)}}});
