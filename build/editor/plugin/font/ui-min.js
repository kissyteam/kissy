/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:17
*/
KISSY.add("editor/plugin/font/ui",function(e,f,h,i){e=i.Select.extend({initializer:function(){var a=this,c=a.get("editor");a.on("click",function(b){var b=b.target.get("value"),d=a.get("cmdType");c.execCommand(d,b)});c.on("selectionChange",function(){if(c.get("mode")!=f.Mode.SOURCE_MODE){var b=a.get("cmdType"),d=a.get("menu");if(d=d.get&&d.get("children")){b=c.queryCommandValue(b);if(!1!==b)for(var b=(b+"").toLowerCase(),g=0;g<d.length;g++){var e=d[g].get("value");if(b==e.toLowerCase()){a.set("value",
e);return}}a.set("value",null)}}})}});return{Button:h.extend({initializer:function(){var a=this,c=a.get("editor"),b=a.get("cmdType");a.on("click",function(){a.get("checked")?c.execCommand(b):c.execCommand(b,!1);c.focus()});c.on("selectionChange",function(){if(c.get("mode")!=f.Mode.SOURCE_MODE){var b=a.get("cmdType");c.queryCommandValue(b)?a.set("checked",!0):a.set("checked",!1)}})}},{ATTRS:{checkable:{value:!0},mode:{value:f.Mode.WYSIWYG_MODE}}}),Select:e}},{requires:["editor","../button","../menubutton"]});
