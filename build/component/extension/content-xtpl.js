/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 15 17:42
*/
KISSY.add("component/extension/content-xtpl",function(e,c,i,h){c=function(d,b,a,c){a=this.utils;if("5.0.0"!==e.version)throw Error("current xtemplate file("+this.name+")(v5.0.0) need to be recompiled using current kissy(v"+e.version+")!");a=a.callCommand;b.write('<div class="');var f={escape:1},g=[];g.push("content");f.params=g;if((a=a(this,d,f,b,"getBaseCssClasses",1))&&a.isBuffer)b=a,a=c;b.write(a,!0);b.write('">');d=d.resolve(["content"]);b.write(d,!1);b.write("</div>");return b};c.TPL_NAME=h.name;
return c});
