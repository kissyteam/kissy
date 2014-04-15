/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 15 17:43
*/
KISSY.add("date/popup-picker/render-xtpl",["date/picker-xtpl"],function(h,e,c,f){c=function(d,b,c,j){var i=this.nativeCommands,a=this.utils;if("5.0.0"!==h.version)throw Error("current xtemplate file("+this.name+")(v5.0.0) need to be recompiled using current kissy(v"+h.version+")!");a=a.callCommand;i=i.include;b.write('<div class="');var g={escape:1},k=[];k.push("content");g.params=k;if((a=a(this,d,g,b,"getBaseCssClasses",1))&&a.isBuffer)b=a,a=j;b.write(a,!0);b.write('">\r\n    ');a={};g=[];g.push("date/picker-xtpl");
a.params=g;e("date/picker-xtpl");a.params[0]=f.resolve(a.params[0]);if((d=i.call(this,d,a,b,2,c))&&d.isBuffer)b=d,d=j;b.write(d,!1);b.write("\r\n</div>");return b};c.TPL_NAME=f.name;return c});
KISSY.add("date/popup-picker",["./popup-picker/render-xtpl","date/picker","component/extension/shim","component/extension/align"],function(h,e){var c=e("./popup-picker/render-xtpl"),f=e("date/picker"),d=e("component/extension/shim"),b=e("component/extension/align"),c=f.getDefaultRender().extend({},{ATTRS:{contentTpl:{value:c}}});return f.extend([d,b],{},{xclass:"popup-date-picker",ATTRS:{xrender:{value:c}}})});
