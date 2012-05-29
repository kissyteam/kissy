/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 29 18:24
*/
KISSY.add("editor/plugin/font/ui",function(f,i,d,k){function e(){e.superclass.constructor.apply(this,arguments)}function c(){c.superclass.constructor.apply(this,arguments)}var j=i.Utils.getQueryCmd;f.extend(e,k,{click:function(a){var b=a.newVal,g=this.get("cmdType"),a=a.prevVal,h=this.get("editor");h.focus();b==a?h.execCommand(g,b,!1):h.execCommand(g,b)},selectionChange:function(a){for(var b=a.path,a=j(this.get("cmdType")),g=this.get("items"),h=this.get("editor"),b=b.elements,d=0,e;d<b.length;d++){e=
b[d];for(var c=0;c<g.length;c++){var f=g[c].value;if(h.execCommand(a,f,e)){this.set("value",f);return}}}(a=this.get("defaultValue"))?this.set("value",a):this.reset("value")}});f.extend(c,d,{offClick:function(){var a=this.get("cmdType"),b=this.get("editor");b.execCommand(a);b.focus()},onClick:function(){var a=this.get("cmdType"),b=this.get("editor");b.execCommand(a,!1);b.focus()},selectionChange:function(a){var b=this.get("editor"),c=j(this.get("cmdType"));b.execCommand(c,a.path)?this.set("state",
d.ON):this.set("state",d.OFF)}},{ATTRS:{mode:{value:i.WYSIWYG_MODE}}});return{Button:c,Select:e}},{requires:["editor","../button/","../select/"]});
