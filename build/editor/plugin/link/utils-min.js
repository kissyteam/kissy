/*
Copyright 2013, KISSY v1.50
MIT Licensed
build time: Dec 4 22:11
*/
KISSY.add("editor/plugin/link/utils",["editor"],function(i,j){var k=j("editor"),l=i.Node,h=k.Style,m={element:"a",attributes:{href:"#(href)",title:"#(title)",_keSavedHref:"#(_keSavedHref)",target:"#(target)"}};return{removeLink:function(b,c){b.execCommand("save");var a=b.getSelection(),d=a.getRanges()[0];if(d&&d.collapsed)d=a.createBookmarks(),c._4eRemove(!0),a.selectBookmarks(d);else if(d){for(var a=c[0],d=a.attributes,e={},f=0;f<d.length;f++){var g=d[f];g.specified&&(e[g.name]=g.value)}a.style.cssText&&
(e.style=a.style.cssText);(new h(m,e)).remove(b.get("document")[0])}b.execCommand("save");b.notifySelectionChange()},applyLink:function(b,c,a){c._keSavedHref=c.href;if(a)b.execCommand("save"),a.attr(c);else if(a=(a=b.getSelection())&&a.getRanges()[0],!a||a.collapsed)c=new l("<a>"+c.href+"</a>",c,b.get("document")[0]),b.insertElement(c);else{b.execCommand("save");var d=new h(d,c);d.apply(b.get("document")[0])}b.execCommand("save");b.notifySelectionChange()},_keSavedHref:"_keSavedHref"}});
