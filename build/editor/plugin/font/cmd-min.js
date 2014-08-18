/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:22
*/
KISSY.add("editor/plugin/font/cmd",["editor"],function(m,j){function k(b,c){var f=b.nodeName();if(c.element!==f)return!1;var d=c.styles,a,e;for(e in d)if(a=b.style(e))return a;d=c.overrides;for(e=0;e<d.length;e++)if(a=d[e],a.element===f){var l=a.attributes,g;for(g in l)if(a=b.attr(g))return a}return!1}var h=j("editor"),i=h.Utils.getQueryCmd;return{addButtonCmd:function(b,c,f){var d=i(c);b.hasCommand(c)||(b.addCommand(c,{exec:function(a){var e=a.get("document")[0];a.execCommand("save");a.queryCommandValue(c)?
f.remove(e):f.apply(e);a.execCommand("save");a.notifySelectionChange()}}),b.addCommand(d,{exec:function(a){if((a=a.getSelection())&&!a.isInvalid)return a=a.getStartElement(),a=new h.ElementPath(a),f.checkActive(a)}}))},addSelectCmd:function(b,c,f){var d=i(c);b.hasCommand(c)||(b.addCommand(c,{exec:function(a,e){a.focus();var b=a.queryCommandValue(c)||"",g=new h.Style(f,{value:e}),d=a.get("document")[0];a.execCommand("save");e.toLowerCase()===b.toLowerCase()?g.remove(d):g.apply(d);a.execCommand("save")}}),
b.addCommand(d,{exec:function(a){if((a=a.getSelection())&&!a.isInvalid){var a=a.getStartElement(),a=new h.ElementPath(a),e=a.elements,b,c,d;for(c=0;c<e.length;c++)if(b=e[c],!(a.block&&b[0]===a.block[0]||a.blockLimit&&b[0]===a.blockLimit[0]))if(d=k(b,f),!1!==d)break;return d}}}))}}});
