/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Apr 4 12:10
*/
KISSY.add("component/extension/content-xtpl",[],function(f,c,i,h){c=function(d,a,b,c){b=this.utils;if("1.50"!==f.version)throw Error("current xtemplate file("+this.name+")(v1.50) need to be recompiled using current kissy(v"+f.version+")!");b=b.callCommand;a.write('<div id="ks-content-');var e=d.resolve(["id"]);a.write(e,!0);a.write('"\r\n           class="');var e={escape:1},g=[];g.push("content");e.params=g;if((b=b(this,d,e,a,"getBaseCssClasses",2))&&b.isBuffer)a=b,b=c;a.write(b,!0);a.write('">');
d=d.resolve(["content"]);a.write(d,!1);a.write("</div>");return a};c.TPL_NAME=h.name;return c});
