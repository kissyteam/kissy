/*
Copyright 2012, KISSY UI Library v1.30
MIT Licensed
build time: Dec 20 22:28
*/
KISSY.add("separator",function(b,a,c){return a.Controller.extend({},{ATTRS:{focusable:{value:!1},disabled:{value:!0},handleMouseEvents:{value:!1},xrender:{value:c}}},{xclass:"separator"})},{requires:["component/base","separator/separatorRender"]});KISSY.add("separator/separatorRender",function(b,a){return a.Render.extend({createDom:function(){this.get("el").attr("role","separator")}})},{requires:["component/base"]});
