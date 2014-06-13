/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:43
*/
KISSY.add("date/popup-picker",["./popup-picker/render-xtpl","date/picker","component/extension/shim","component/extension/align"],function(a,e,f,g){var a=e("./popup-picker/render-xtpl"),f=e("date/picker"),c=e("component/extension/shim"),e=e("component/extension/align");g.exports=f.extend([c,e],{},{xclass:"popup-date-picker",ATTRS:{contentTpl:{value:a}}})});
KISSY.add("date/popup-picker/render-xtpl",["date/picker-xtpl"],function(a,e,f,g){a=function(c,b,a){var d=this.root.utils.callFn,g=this.root.nativeCommands.include;b.write('<div class="',0);var h={escape:1},f=[];f.push("content");h.params=f;if((d=d(this,c,h,b,["getBaseCssClasses"],0,1))&&d.isBuffer)b=d,d=a;b.write(d,!0);b.write('">\r\n    ',0);d={};h=[];h.push("date/picker-xtpl");d.params=h;e("date/picker-xtpl");if((c=g.call(this,c,d,b,2))&&c.isBuffer)b=c,c=a;b.write(c,!1);b.write("\r\n</div>",0);
return b};a.TPL_NAME=g.name;a.version="5.0.0";g.exports=a});
