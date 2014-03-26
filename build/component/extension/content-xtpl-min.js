/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 25 17:47
*/
KISSY.add("component/extension/content-xtpl",[],function(d,h,i,g){d=function(e,b,a,c,d){c=this.utils;if("1.50"!==b.version)throw Error("current xtemplate file("+this.name+")(v1.50) need to be recompiled using current kissy(v"+b.version+")!");b=c.callCommand;a.write('<div id="ks-content-');c=e.resolve(["id"]);a.write(c,!0);a.write('"\r\n           class="');var c={escape:1},f=[];f.push("content");c.params=f;if((b=b(this,e,c,a,"getBaseCssClasses",2))&&b.isBuffer)a=b,b=d;a.write(b,!0);a.write('">');
e=e.resolve(["content"]);a.write(e,!1);a.write("</div>");return a};d.TPL_NAME=g.name;return d});
