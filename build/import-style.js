/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 24 19:32
*/
(function(e){e.importStyle=function(b){"string"===typeof b&&(b=b.split(","));var g=e.Loader.Utils,h=e.Loader.Status,f=g.each,c=new e.Loader.ComboLoader,b=g.createModules(b),d=[];f(b,function(a){d.push.apply(d,a.getNormalizedModules())});var d=c.calculate(d,[]),i=[];f(d,function(a){"css"===a.getType()?(a.status=h.ATTACHED,i.push(a)):a.status=h.INIT});c=c.getComboUrls(i);c.css&&f(c.css,function(a){document.writeln(' <link rel="stylesheet" href="'+a.url+'">')})}})(KISSY);
