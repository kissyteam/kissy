/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:46
*/
KISSY.add("editor/plugin/font/ui",["editor","../button","../menubutton"],function(e,d,i,h){var g=d("editor"),e=d("../button"),d=d("../menubutton").Select.extend({initializer:function(){var a=this,c=a.get("editor");a.on("click",function(b){var b=b.target.get("value"),f=a.get("cmdType");c.execCommand(f,b)});c.on("selectionChange",function(){if(c.get("mode")!==g.Mode.SOURCE_MODE){var b=a.get("cmdType"),f=a.get("menu");if(f=f.get&&f.get("children")){b=c.queryCommandValue(b);if(!1!==b)for(var b=(b+"").toLowerCase(),
d=0;d<f.length;d++){var e=f[d].get("value");if(b===e.toLowerCase()){a.set("value",e);return}}a.set("value",null)}}})}}),e=e.extend({initializer:function(){var a=this,c=a.get("editor"),b=a.get("cmdType");a.on("click",function(){a.get("checked")?c.execCommand(b):c.execCommand(b,!1);c.focus()});c.on("selectionChange",function(){if(c.get("mode")!==g.Mode.SOURCE_MODE){var b=a.get("cmdType");c.queryCommandValue(b)?a.set("checked",!0):a.set("checked",!1)}})}},{ATTRS:{checkable:{value:!0},mode:{value:g.Mode.WYSIWYG_MODE}}});
h.exports={Button:e,Select:d}});
