/*
Copyright 2013, KISSY v1.40dev
MIT Licensed
build time: Sep 16 15:08
*/
KISSY.add("date/popup-picker/render-xtpl",function(){return function(b,c,d){var f=this.config.utils.getPropertyOrRunCommand,c='<div class="',a={},e=[];e.push("content");a.params=e;a=f(this,b,a,"getBaseCssClasses",0,1,!0,d);c=c+a+'">\r\n    ';a={};e=[];e.push("date/picker/picker-xtpl");a.params=e;b=f(this,b,a,"include",0,2,!1,d);return c+b+"\r\n</div>"}});
KISSY.add("date/popup-picker",function(b,c,d,f,a){b=d.getDefaultRender().extend({},{ATTRS:{contentTpl:{value:c}}});return d.extend([a,f],{},{xclass:"popup-date-picker",ATTRS:{xrender:{value:b}}})},{requires:["./popup-picker/render-xtpl","date/picker","component/extension/align","component/extension/shim"]});
