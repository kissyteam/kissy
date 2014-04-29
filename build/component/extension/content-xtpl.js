/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 29 14:58
*/
KISSY.add("component/extension/content-xtpl",[],function(e,c,i,h){c=function(d,a,b,c){b=this.utils.callFn;if("5.0.0"!==e.version)throw Error("current xtemplate file("+this.name+")(v5.0.0) need to be recompiled using current kissy(v"+e.version+")!");a.write('<div class="',0);var f={escape:1},g=[];g.push("content");f.params=g;if((b=b(this,d,f,a,["getBaseCssClasses"],0,1))&&b.isBuffer)a=b,b=c;a.write(b,!0);a.write('">',0);d=d.resolve(["content"],0);a.write(d,!1);a.write("</div>",0);return a};c.TPL_NAME=
h.name;return c});
