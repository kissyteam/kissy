/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Aug 26 16:06
*/
KISSY.add("date/popup-picker",["./popup-picker/render-xtpl","date/picker","component/extension/shim","component/extension/align"],function(g,d,f,e){var g=d("./popup-picker/render-xtpl"),f=d("date/picker"),b=d("component/extension/shim"),d=d("component/extension/align");e.exports=f.extend([b,d],{},{xclass:"popup-date-picker",ATTRS:{contentTpl:{value:g}}})});
KISSY.add("date/popup-picker/render-xtpl",["date/picker-xtpl"],function(g,d,f,e){e.exports=function(b,a,e){var i=this.pos={line:1,col:1},c=this.root.utils.callFn,g=this.root.nativeCommands.include;a.append('<div class="');var h={escape:1},f=[];f.push("content");h.params=f;i.line=1;i.col=33;if((c=c(this,b,h,a,["getBaseCssClasses"]))&&c.isBuffer)a=c,c=e;a.writeEscaped(c);a.append('">\r\n    ');c={};h=[];h.push("date/picker-xtpl");c.params=h;d("date/picker-xtpl");i.line=2;i.col=15;if((b=g.call(this,
b,c,a))&&b.isBuffer)a=b,b=e;a.write(b);a.append("\r\n</div>");return a};e.exports.TPL_NAME=e.name});
