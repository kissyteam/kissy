/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Feb 25 19:34
*/
KISSY.add("date/popup-picker/render-xtpl",["date/picker-xtpl"],function(d,e,b,f){d=function(c,a,d){var b,g=a.escapeHtml,a=this.nativeCommands,i=this.utils;"undefined"!==typeof f&&f.kissy&&(b=f);var h=i.callCommand,i=a.include,a='<div class="',j={},k=[];k.push("content");j.params=k;h=h(this,c,j,"getBaseCssClasses",1);a+=g(h);a+='">\n    ';g={};h=[];h.push("date/picker-xtpl");g.params=h;b&&(e("date/picker-xtpl"),g.params[0]=b.resolveByName(g.params[0]));if((c=i.call(this,c,g,d))||0===c)a+=c;return a+
"\n</div>"};d.TPL_NAME="E:/code/kissy_git/kissy/kissy/src/date/popup-picker/src/popup-picker/render.xtpl.html";return d});
KISSY.add("date/popup-picker",["./popup-picker/render-xtpl","date/picker","component/extension/shim","component/extension/align"],function(d,e){var b=e("./popup-picker/render-xtpl"),f=e("date/picker"),c=e("component/extension/shim"),a=e("component/extension/align"),b=f.getDefaultRender().extend({},{ATTRS:{contentTpl:{value:b}}});return f.extend([c,a],{},{xclass:"popup-date-picker",ATTRS:{xrender:{value:b}}})});
