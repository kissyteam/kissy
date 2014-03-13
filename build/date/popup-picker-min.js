/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 13 17:49
*/
KISSY.add("date/popup-picker/render-xtpl",["date/picker-xtpl"],function(e,f,b,c){e=function(d,a,e){var b,g=a.escapeHtml,a=this.nativeCommands,i=this.utils;"undefined"!==typeof c&&c.kissy&&(b=c);var h=i.callCommand,i=a.include,a='<div class="',j={},k=[];k.push("content");j.params=k;h=h(this,d,j,"getBaseCssClasses",1);a+=g(h);a+='">\n    ';g={};h=[];h.push("date/picker-xtpl");g.params=h;b&&(f("date/picker-xtpl"),g.params[0]=b.resolveByName(g.params[0]));if((d=i.call(this,d,g,e))||0===d)a+=d;return a+
"\n</div>"};e.TPL_NAME=c.name;return e});KISSY.add("date/popup-picker",["./popup-picker/render-xtpl","date/picker","component/extension/shim","component/extension/align"],function(e,f){var b=f("./popup-picker/render-xtpl"),c=f("date/picker"),d=f("component/extension/shim"),a=f("component/extension/align"),b=c.getDefaultRender().extend({},{ATTRS:{contentTpl:{value:b}}});return c.extend([d,a],{},{xclass:"popup-date-picker",ATTRS:{xrender:{value:b}}})});
