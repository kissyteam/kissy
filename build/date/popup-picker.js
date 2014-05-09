/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 9 13:55
*/
KISSY.add("date/popup-picker",["./popup-picker/render-xtpl","date/picker","component/extension/shim","component/extension/align"],function(d,e){var f=e("./popup-picker/render-xtpl"),g=e("date/picker"),b=e("component/extension/shim"),a=e("component/extension/align");return g.extend([b,a],{},{xclass:"popup-date-picker",ATTRS:{contentTpl:{value:f}}})});
KISSY.add("date/popup-picker/render-xtpl",["date/picker-xtpl"],function(d,e,f,g){d=function(b,a,d){var c=this.root.utils.callFn,g=this.root.nativeCommands.include;a.write('<div class="',0);var h={escape:1},f=[];f.push("content");h.params=f;if((c=c(this,b,h,a,["getBaseCssClasses"],0,1))&&c.isBuffer)a=c,c=d;a.write(c,!0);a.write('">\r\n    ',0);c={};h=[];h.push("date/picker-xtpl");c.params=h;e("date/picker-xtpl");if((b=g.call(this,b,c,a,2))&&b.isBuffer)a=b,b=d;a.write(b,!1);a.write("\r\n</div>",0);
return a};d.TPL_NAME=g.name;d.version="5.0.0";return d});
