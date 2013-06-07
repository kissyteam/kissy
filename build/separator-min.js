/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jun 7 13:55
*/
KISSY.add("separator/render",function(b,a){return a.Render.extend({initializer:function(){this.get("elAttrs").role="separator"}})},{requires:["component/base"]});KISSY.add("separator",function(b,a,c){return a.Controller.extend({},{ATTRS:{focusable:{value:!1},disabled:{value:!0},handleMouseEvents:{value:!1},xrender:{value:c}}},{xclass:"separator"})},{requires:["component/base","separator/render"]});
