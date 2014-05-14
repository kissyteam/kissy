/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 14 22:21
*/
KISSY.add("editor/plugin/link/utils",["editor","node"],function(m,h){var k=h("editor"),l=h("node"),i=k.Style,j={element:"a",attributes:{href:"#(href)",title:"#(title)",_ke_saved_href:"#(_ke_saved_href)",target:"#(target)"}};return{removeLink:function(b,c){b.execCommand("save");var a=b.getSelection(),d=a.getRanges()[0];if(d&&d.collapsed)d=a.createBookmarks(),c._4eRemove(!0),a.selectBookmarks(d);else if(d){for(var a=c[0],d=a.attributes,e={},f=0;f<d.length;f++){var g=d[f];g.specified&&(e[g.name]=g.value)}a.style.cssText&&
(e.style=a.style.cssText);(new i(j,e)).remove(b.get("document")[0])}b.execCommand("save");b.notifySelectionChange()},applyLink:function(b,c,a){c._ke_saved_href=c.href;a?(b.execCommand("save"),a.attr(c)):(a=(a=b.getSelection())&&a.getRanges()[0],!a||a.collapsed?(c=new l("<a>"+c.href+"</a>",c,b.get("document")[0]),b.insertElement(c)):(b.execCommand("save"),(new i(j,c)).apply(b.get("document")[0])));b.execCommand("save");b.notifySelectionChange()},savedHref:"_ke_saved_href"}});
