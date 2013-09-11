/*
Copyright 2013, KISSY v1.40dev
MIT Licensed
build time: Sep 11 14:15
*/
KISSY.add("date/popup-picker",function(a,b,c,d){a=b.getDefaultRender().extend({},{ATTRS:{contentTpl:{value:'<div class="{{getBaseCssClasses "content"}}">{{{include "date/picker/picker-tpl"}}}</div>'}}});return b.extend([d,c],{},{xclass:"popup-date-picker",ATTRS:{xrender:{value:a}}})},{requires:["date/picker","component/extension/align","component/extension/shim"]});
