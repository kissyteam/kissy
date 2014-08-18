/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:22
*/
KISSY.add("editor/plugin/font/ui",["editor","../button","../menubutton"],function(j,d){var f=d("editor"),h=d("../button"),i=d("../menubutton").Select.extend({initializer:function(){var a=this,c=a.get("editor");a.on("click",function(b){var b=b.target.get("value"),e=a.get("cmdType");c.execCommand(e,b)});c.on("selectionChange",function(){if(c.get("mode")!==f.Mode.SOURCE_MODE){var b=a.get("cmdType"),e=a.get("menu");if(e=e.get&&e.get("children")){b=c.queryCommandValue(b);if(!1!==b)for(var b=(b+"").toLowerCase(),
d=0;d<e.length;d++){var g=e[d].get("value");if(b===g.toLowerCase()){a.set("value",g);return}}a.set("value",null)}}})}});return{Button:h.extend({initializer:function(){var a=this,c=a.get("editor"),b=a.get("cmdType");a.on("click",function(){a.get("checked")?c.execCommand(b):c.execCommand(b,!1);c.focus()});c.on("selectionChange",function(){if(c.get("mode")!==f.Mode.SOURCE_MODE){var b=a.get("cmdType");c.queryCommandValue(b)?a.set("checked",!0):a.set("checked",!1)}})}},{ATTRS:{checkable:{value:!0},mode:{value:f.Mode.WYSIWYG_MODE}}}),
Select:i}});
