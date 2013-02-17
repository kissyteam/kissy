/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Feb 17 17:29
*/
KISSY.add("editor/plugin/link/utils",function(j,k){var l=j.Node,h=k.Style,i={element:"a",attributes:{href:"#(href)",title:"#(title)",_ke_saved_href:"#(_ke_saved_href)",target:"#(target)"}};return{removeLink:function(b,c){b.execCommand("save");var a=b.getSelection(),d=a.getRanges()[0];if(d&&d.collapsed)d=a.createBookmarks(),c._4e_remove(!0),a.selectBookmarks(d);else if(d){for(var a=c[0],d=a.attributes,e={},f=0;f<d.length;f++){var g=d[f];g.specified&&(e[g.name]=g.value)}a.style.cssText&&(e.style=a.style.cssText);
(new h(i,e)).remove(b.get("document")[0])}b.execCommand("save");b.notifySelectionChange()},applyLink:function(b,c,a){c._ke_saved_href=c.href;a?(b.execCommand("save"),a.attr(c)):(a=(a=b.getSelection())&&a.getRanges()[0],!a||a.collapsed?(c=new l("<a>"+c.href+"</a>",c,b.get("document")[0]),b.insertElement(c)):(b.execCommand("save"),(new h(i,c)).apply(b.get("document")[0])));b.execCommand("save");b.notifySelectionChange()},_ke_saved_href:"_ke_saved_href"}},{requires:["editor"]});
