/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 13 18:03
*/
KISSY.add("separator/render",["component/control"],function(b,a){return a("component/control").getDefaultRender().extend({beforeCreateDom:function(a){a.elAttrs.role="separator"}})});KISSY.add("separator",["component/control","separator/render"],function(b,a){var c=a("component/control"),d=a("separator/render");return c.extend({},{ATTRS:{focusable:{value:!1},disabled:{value:!0},handleGestureEvents:{value:!1},xrender:{value:d}},xclass:"separator"})});
