/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 28 20:23
*/
KISSY.add("editor/plugin/font/cmd",function(l,g){function j(c,b){var f=c.nodeName();if(b.element!=f)return!1;var e=b.styles,a,d;for(d in e)if(a=c.style(d))return a;e=b.overrides;for(d=0;d<e.length;d++)if(a=e[d],a.element==f){var k=a.attributes,h;for(h in k)if(a=c.attr(h))return a}return!1}var i=g.Utils.getQueryCmd;return{addButtonCmd:function(c,b,f){var e=i(b);c.hasCommand(b)||(c.addCommand(b,{exec:function(a){var d=a.get("document")[0];a.execCommand("save");a.queryCommandValue(b)?f.remove(d):f.apply(d);
a.execCommand("save");a.notifySelectionChange()}}),c.addCommand(e,{exec:function(a){if((a=a.getSelection())&&!a.isInvalid)return a=a.getStartElement(),a=new g.ElementPath(a),f.checkActive(a)}}))},addSelectCmd:function(c,b,f){var e=i(b);c.hasCommand(b)||(c.addCommand(b,{exec:function(a,d,b){a.focus();var d=new g.Style(f,{value:d}),c=a.get("document")[0];a.execCommand("save");void 0===b||b?d.apply(c):d.remove(c);a.execCommand("save")}}),c.addCommand(e,{exec:function(a){if((a=a.getSelection())&&!a.isInvalid){var a=
a.getStartElement(),a=new g.ElementPath(a),d=a.elements,b,c,e;for(c=0;c<d.length;c++)if(b=d[c],!(b[0]==a.block[0]||b[0]==a.blockLimit[0]))if(e=j(b,f),!1!==e)break;return e}}}))}}},{requires:["editor"]});
