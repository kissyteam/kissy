/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 31 19:17
*/
KISSY.add("date/popup-picker/render-xtpl",["date/picker-xtpl"],function(g,h,d,e){g=function(c,a,b,g,d){var i,j=this.nativeCommands,f=this.utils;if("1.50"!==a.version)throw Error("current xtemplate file("+this.name+")(v1.50) need to be recompiled using current kissy(v"+a.version+")!");"undefined"!==typeof e&&e.kissy&&(i=e);a=f.callCommand;j=j.include;b.write('<div class="');var f={escape:1},k=[];k.push("content");f.params=k;if((a=a(this,c,f,b,"getBaseCssClasses",1))&&a.isBuffer)b=a,a=d;b.write(a,!0);
b.write('">\n    ');a={};f=[];f.push("date/picker-xtpl");a.params=f;i&&(h("date/picker-xtpl"),a.params[0]=i.resolve(a.params[0]));if((c=j.call(this,c,a,b,2,g))&&c.isBuffer)b=c,c=d;b.write(c,!1);b.write("\n</div>");return b};g.TPL_NAME=e.name;return g});
KISSY.add("date/popup-picker",["./popup-picker/render-xtpl","date/picker","component/extension/shim","component/extension/align"],function(g,h){var d=h("./popup-picker/render-xtpl"),e=h("date/picker"),c=h("component/extension/shim"),a=h("component/extension/align"),d=e.getDefaultRender().extend({},{ATTRS:{contentTpl:{value:d}}});return e.extend([c,a],{},{xclass:"popup-date-picker",ATTRS:{xrender:{value:d}}})});
