/*
Copyright 2013, KISSY v1.50dev
MIT Licensed
build time: Nov 19 15:38
*/
KISSY.add("date/popup-picker/render-xtpl",[],function(){return function(a,b,e){var f=this.config.utils.getPropertyOrRunCommand,b='<div class="',c={},d=[];d.push("content");c.params=d;c=f(this,a,c,"getBaseCssClasses",0,1,!0,e);b=b+c+'">\n    ';c={};d=[];d.push("date/picker/picker-xtpl");c.params=d;a=f(this,a,c,"include",0,2,!1,e);return b+a+"\n</div>"}});
KISSY.add("date/popup-picker",["./popup-picker/render-xtpl","date/picker","component/extension/shim","component/extension/align"],function(){var a=this.require("./popup-picker/render-xtpl"),b=this.require("date/picker"),e=this.require("component/extension/shim"),f=this.require("component/extension/align"),a=b.getDefaultRender().extend({},{ATTRS:{contentTpl:{value:a}}});return b.extend([e,f],{},{xclass:"popup-date-picker",ATTRS:{xrender:{value:a}}})});
