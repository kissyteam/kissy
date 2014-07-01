/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 1 22:58
*/
KISSY.add("date/popup-picker",["./popup-picker/render-xtpl","date/picker","component/extension/shim","component/extension/align"],function(b,e,f,g){var b=e("./popup-picker/render-xtpl"),f=e("date/picker"),c=e("component/extension/shim"),e=e("component/extension/align");g.exports=f.extend([c,e],{},{xclass:"popup-date-picker",ATTRS:{contentTpl:{value:b}}})});
KISSY.add("date/popup-picker/render-xtpl",["date/picker-xtpl"],function(b,e,f,g){b=function(c,a,b){var d=this.root.utils.callFn,g=this.root.nativeCommands.include;a.write('<div class="',0);var h={escape:1},f=[];f.push("content");h.params=f;if((d=d(this,c,h,a,["getBaseCssClasses"],0,1))&&d.isBuffer)a=d,d=b;a.write(d,!0);a.write('">\r\n    ',0);d={};h=[];h.push("date/picker-xtpl");d.params=h;e("date/picker-xtpl");if((c=g.call(this,c,d,a,2))&&c.isBuffer)a=c,c=b;a.write(c,!1);a.write("\r\n</div>",0);
return a};b.TPL_NAME=g.name;g.exports=b});
