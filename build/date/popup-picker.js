/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 13:54
*/
KISSY.add("date/popup-picker",["./popup-picker/render-xtpl","date/picker","component/extension/shim","component/extension/align"],function(g,d,f,e){var g=d("./popup-picker/render-xtpl"),f=d("date/picker"),b=d("component/extension/shim"),d=d("component/extension/align");e.exports=f.extend([b,d],{},{xclass:"popup-date-picker",ATTRS:{contentTpl:{value:g}}})});
KISSY.add("date/popup-picker/render-xtpl",["date/picker-xtpl"],function(g,d,f,e){e.exports=function(b,a,e){var c=this.root.utils.callFn,g=this.root.nativeCommands.include;a.write('<div class="',0);var h={escape:1},f=[];f.push("content");h.params=f;if((c=c(this,b,h,a,["getBaseCssClasses"],0,1))&&c.isBuffer)a=c,c=e;a.write(c,!0);a.write('">\r\n    ',0);c={};h=[];h.push("date/picker-xtpl");c.params=h;d("date/picker-xtpl");if((b=g.call(this,b,c,a,2))&&b.isBuffer)a=b,b=e;a.write(b,!1);a.write("\r\n</div>",
0);return a};e.exports.TPL_NAME=e.name});
