/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 15 17:22
*/
KISSY.add("editor/plugin/font/ui",function(f,g,l,m){var j=g.Utils.getQueryCmd,f=m.Select.extend({initializer:function(){var a=this,c=a.get("editor");a.on("click",function(b){var e=b.target.get("value"),d=a.get("cmdType"),b=b.prevTarget&&b.prevTarget.get("value");c.focus();e==b?c.execCommand(d,e,!1):c.execCommand(d,e)});c.on("selectionChange",function(b){if(c.get("mode")!=g.SOURCE_MODE){var e=b.path,b=j(a.get("cmdType")),d=a.get("menu"),d=d.get&&d.get("children"),e=e.elements;if(d){for(var h=0,f;h<
e.length;h++){f=e[h];for(var i=0;i<d.length;i++){var k=d[i].get("value");if(c.execCommand(b,k,f)){a.set("value",k);return}}}a.set("value",null)}}})}});return{Button:l.extend({initializer:function(){var a=this,c=a.get("editor"),b=a.get("cmdType");a.on("click",function(){a.get("checked")?c.execCommand(b):c.execCommand(b,!1);c.focus()});c.on("selectionChange",function(b){if(c.get("mode")!=g.SOURCE_MODE){var d=j(a.get("cmdType"));c.execCommand(d,b.path)?a.set("checked",!0):a.set("checked",!1)}})}},{ATTRS:{checkable:{value:!0},
mode:{value:g.WYSIWYG_MODE}}}),Select:f}},{requires:["editor","../button/","../menubutton/"]});
