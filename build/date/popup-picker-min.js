/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:18
*/
KISSY.add("date/popup-picker/render-xtpl",["date/picker-xtpl"],function(j,d,c,e){return function(f){var a,c;a=this.config.utils;"undefined"!==typeof e&&e.kissy&&(c=e);var h=a.renderOutput,i=a.runInlineCommand;a='<div class="';var b={},g=[];g.push("content");b.params=g;b=i(this,f,b,"getBaseCssClasses",1);a+=h(b,!0);a+='">\n    ';b={};g=[];g.push("date/picker-xtpl");b.params=g;c&&(d("date/picker-xtpl"),b.params[0]=c.resolveByName(b.params[0]));f=i(this,f,b,"include",2);a+=h(f,!1);return a+"\n</div>"}});
KISSY.add("date/popup-picker",["./popup-picker/render-xtpl","date/picker","component/extension/shim","component/extension/align"],function(j,d){var c=d("./popup-picker/render-xtpl"),e=d("date/picker"),f=d("component/extension/shim"),a=d("component/extension/align"),c=e.getDefaultRender().extend({},{ATTRS:{contentTpl:{value:c}}});return e.extend([f,a],{},{xclass:"popup-date-picker",ATTRS:{xrender:{value:c}}})});
