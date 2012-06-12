/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 13 00:29
*/
KISSY.add("editor/plugin/font/cmd",function(i,e){var f=e.Utils.getQueryCmd;return{addButtonCmd:function(a,b,d){var e=f(b);a.hasCommand(b)||(a.addCommand(b,{exec:function(g,c){var a=g.get("document")[0];g.execCommand("save");c||void 0===c?d.apply(a):d.remove(a);g.execCommand("save");g.notifySelectionChange()}}),a.addCommand(e,{exec:function(a,c){return d.checkActive(c)}}))},addSelectCmd:function(a,b,d){var h=f(b);a.hasCommand(b)||(a.addCommand(b,{exec:function(a,c,b){var c=new e.Style(d,{value:c}),
f=a.get("document")[0];a.execCommand("save");void 0===b||b?c.apply(f):c.remove(f);a.execCommand("save")}}),a.addCommand(h,{exec:function(a,c,b){return(new e.Style(d,{value:c})).checkElementRemovable(b,!0)}}))}}},{requires:["editor"]});
