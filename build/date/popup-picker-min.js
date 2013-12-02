/*
Copyright 2013, KISSY v1.50dev
MIT Licensed
build time: Dec 2 15:13
*/
KISSY.add("date/popup-picker/render-xtpl",["date/picker/picker-xtpl"],function(j,d,c,e){return function(f,b,c){var h,b=this.config.utils;"undefined"!==typeof e&&e.kissy&&(h=e);var i=b.getPropertyOrRunCommand,b='<div class="',a={},g=[];g.push("content");a.params=g;a=i(this,f,a,"getBaseCssClasses",0,1,!0,c);b=b+a+'">\n    ';a={};g=[];g.push("date/picker/picker-xtpl");a.params=g;h&&(d("date/picker/picker-xtpl"),a.params[0]=h.resolveByName(a.params[0]));f=i(this,f,a,"include",0,2,!1,c);return b+f+"\n</div>"}});
KISSY.add("date/popup-picker",["./popup-picker/render-xtpl","date/picker","component/extension/shim","component/extension/align"],function(j,d){var c=d("./popup-picker/render-xtpl"),e=d("date/picker"),f=d("component/extension/shim"),b=d("component/extension/align"),c=e.getDefaultRender().extend({},{ATTRS:{contentTpl:{value:c}}});return e.extend([f,b],{},{xclass:"popup-date-picker",ATTRS:{xrender:{value:c}}})});
