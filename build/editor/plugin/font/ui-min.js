/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 7 00:48
*/
KISSY.add("editor/plugin/font/ui",function(d,e,j,k){var i=e.Utils.getQueryCmd,d=k.extend({click:function(b){var a=b.target.get("value"),c=this.get("cmdType"),b=b.prevTarget&&b.prevTarget.get("value"),f=this.get("editor");f.focus();a==b?f.execCommand(c,a,!1):f.execCommand(c,a)},selectionChange:function(b){var a=b.path,b=i(this.get("cmdType")),c=this.get("menu"),c=c.get&&c.get("children"),f=this.get("editor"),a=a.elements;if(c){for(var g=0,d;g<a.length;g++){d=a[g];for(var h=0;h<c.length;h++){var e=
c[h].get("value");if(f.execCommand(b,e,d)){this.set("value",e);return}}}this.set("value",null)}}});return{Button:j.Toggle.extend({offClick:function(){var b=this.get("cmdType"),a=this.get("editor");a.execCommand(b);a.focus()},onClick:function(){var b=this.get("cmdType"),a=this.get("editor");a.execCommand(b,!1);a.focus()},selectionChange:function(b){var a=this.get("editor"),c=i(this.get("cmdType"));a.execCommand(c,b.path)?this.set("checked",!0):this.set("checked",!1)}},{ATTRS:{mode:{value:e.WYSIWYG_MODE}}}),
Select:d}},{requires:["editor","../button/","../select/"]});
