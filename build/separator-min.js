/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jun 27 03:42
*/
KISSY.add("separator/render",function(b,a){return a.ATTRS.xrender.value.extend({beforeCreateDom:function(a){a.elAttrs.role="separator"}})},{requires:["component/control"]});KISSY.add("separator",function(b,a,c){return a.extend({},{ATTRS:{focusable:{value:!1},disabled:{value:!0},handleMouseEvents:{value:!1},xrender:{value:c}},xclass:"separator"})},{requires:["component/control","separator/render"]});
