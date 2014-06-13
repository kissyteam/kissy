/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:47
*/
KISSY.add("editor/plugin/link/utils",["editor","node"],function(h,i,n,l){var h=i("editor"),m=i("node"),j=h.Style,k={element:"a",attributes:{href:"#(href)",title:"#(title)",_ke_saved_href:"#(_ke_saved_href)",target:"#(target)"}};l.exports={removeLink:function(b,c){b.execCommand("save");var a=b.getSelection(),d=a.getRanges()[0];if(d&&d.collapsed)d=a.createBookmarks(),c._4eRemove(!0),a.selectBookmarks(d);else if(d){for(var a=c[0],d=a.attributes,e={},f=0;f<d.length;f++){var g=d[f];g.specified&&(e[g.name]=
g.value)}a.style.cssText&&(e.style=a.style.cssText);(new j(k,e)).remove(b.get("document")[0])}b.execCommand("save");b.notifySelectionChange()},applyLink:function(b,c,a){c._ke_saved_href=c.href;a?(b.execCommand("save"),a.attr(c)):(a=(a=b.getSelection())&&a.getRanges()[0],!a||a.collapsed?(c=new m("<a>"+c.href+"</a>",c,b.get("document")[0]),b.insertElement(c)):(b.execCommand("save"),(new j(k,c)).apply(b.get("document")[0])));b.execCommand("save");b.notifySelectionChange()},savedHref:"_ke_saved_href"}});
