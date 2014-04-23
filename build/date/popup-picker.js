/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 23 11:59
*/
KISSY.add("date/popup-picker",["./popup-picker/render-xtpl","date/picker","component/extension/shim","component/extension/align"],function(h,e){var d=e("./popup-picker/render-xtpl"),g=e("date/picker"),c=e("component/extension/shim"),b=e("component/extension/align");return g.extend([c,b],{},{xclass:"popup-date-picker",ATTRS:{contentTpl:{value:d}}})});
KISSY.add("date/popup-picker/render-xtpl",["date/picker-xtpl"],function(h,e,d,g){d=function(c,b,d,j){var i=this.nativeCommands,a=this.utils;if("5.0.0"!==h.version)throw Error("current xtemplate file("+this.name+")(v5.0.0) need to be recompiled using current kissy(v"+h.version+")!");a=a.callCommand;i=i.include;b.write('<div class="');var f={escape:1},k=[];k.push("content");f.params=k;if((a=a(this,c,f,b,"getBaseCssClasses",1))&&a.isBuffer)b=a,a=j;b.write(a,!0);b.write('">\r\n    ');a={};f=[];f.push("date/picker-xtpl");
a.params=f;e("date/picker-xtpl");a.params[0]=g.resolve(a.params[0]);if((c=i.call(this,c,a,b,2,d))&&c.isBuffer)b=c,c=j;b.write(c,!1);b.write("\r\n</div>");return b};d.TPL_NAME=g.name;return d});
