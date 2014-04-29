/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 29 14:59
*/
KISSY.add("date/popup-picker",["./popup-picker/render-xtpl","date/picker","component/extension/shim","component/extension/align"],function(h,e){var d=e("./popup-picker/render-xtpl"),f=e("date/picker"),b=e("component/extension/shim"),a=e("component/extension/align");return f.extend([b,a],{},{xclass:"popup-date-picker",ATTRS:{contentTpl:{value:d}}})});
KISSY.add("date/popup-picker/render-xtpl",["date/picker-xtpl"],function(h,e,d,f){d=function(b,a,d,f){var c=this.utils.callFn,j=this.nativeCommands.include;if("5.0.0"!==h.version)throw Error("current xtemplate file("+this.name+")(v5.0.0) need to be recompiled using current kissy(v"+h.version+")!");a.write('<div class="',0);var g={escape:1},i=[];i.push("content");g.params=i;if((c=c(this,b,g,a,["getBaseCssClasses"],0,1))&&c.isBuffer)a=c,c=f;a.write(c,!0);a.write('">\r\n    ',0);c={};g=[];g.push("date/picker-xtpl");
c.params=g;e("date/picker-xtpl");if((b=j.call(this,b,c,a,2,d))&&b.isBuffer)a=b,b=f;a.write(b,!1);a.write("\r\n</div>",0);return a};d.TPL_NAME=f.name;return d});
