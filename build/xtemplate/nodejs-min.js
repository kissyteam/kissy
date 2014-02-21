/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Feb 20 17:32
*/
KISSY.add("xtemplate/nodejs",["xtemplate"],function(f,j){function k(a){var c=a.cache,d=a.extname,e=a.encoding;return function(b){if(c&&g[b])return g[b];var a=new f.Loader.Module({name:b,type:d,runtime:f});"utf-8"===e?a=i.readFileSync((new f.Uri(a.getPath())).getPath(),{encoding:"utf-8"}):(a=i.readFileSync((new f.Uri(a.getPath())).getPath()),a=l.decode(a,e));c&&(g[b]=a);return a}}var i=requireNode("fs"),l=requireNode("iconv-lite"),m=j("xtemplate"),g={},h={extname:"html",encoding:"utf-8"};return{config:function(a){f.mix(h,
a)},loadFromModuleName:function(a,c){var d=c,e={},b;for(b in h)e[b]=h[b];if(d)for(b in d)e[b]=d[b];c=e;d=k(c);c.name=a;c.loader=d;d=d(a);delete c.extname;return new m(d,c)}}});
