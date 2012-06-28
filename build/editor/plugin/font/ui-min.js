/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 28 20:23
*/
KISSY.add("editor/plugin/font/ui",function(f,g,h,i){f=i.Select.extend({initializer:function(){var b=this,c=b.get("editor");b.on("click",function(a){var d=a.target.get("value"),e=b.get("cmdType"),a=a.prevTarget&&a.prevTarget.get("value");d==a?c.execCommand(e,d,!1):c.execCommand(e,d)});c.on("selectionChange",function(){if(c.get("mode")!=g.SOURCE_MODE){var a=b.get("cmdType"),d=b.get("menu");if(d=d.get&&d.get("children")){a=c.queryCommandValue(a);if(!1!==a)for(var a=(a+"").toLowerCase(),e=0;e<d.length;e++){var f=
d[e].get("value");if(a==f.toLowerCase()){b.set("value",f);return}}b.set("value",null)}}})}});return{Button:h.extend({initializer:function(){var b=this,c=b.get("editor"),a=b.get("cmdType");b.on("click",function(){b.get("checked")?c.execCommand(a):c.execCommand(a,!1);c.focus()});c.on("selectionChange",function(){if(c.get("mode")!=g.SOURCE_MODE){var a=b.get("cmdType");c.queryCommandValue(a)?b.set("checked",!0):b.set("checked",!1)}})}},{ATTRS:{checkable:{value:!0},mode:{value:g.WYSIWYG_MODE}}}),Select:f}},
{requires:["editor","../button/","../menubutton/"]});
