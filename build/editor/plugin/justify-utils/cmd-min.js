/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Feb 17 17:29
*/
KISSY.add("editor/plugin/justify-utils/cmd",function(j,c){var i=/(-moz-|-webkit-|start|auto)/gi;return{addCommand:function(b,d,f){b.hasCommand(d)||(b.addCommand(d,{exec:function(a){a.focus();a.execCommand("save");for(var b=a.getSelection(),d=b.createBookmarks(),c=b.getRanges(),g,e,h=c.length-1;0<=h;h--){g=c[h].createIterator();for(g.enlargeBr=!0;e=g.getNextParagraph();)e.removeAttr("align"),(e.css("text-align").replace(i,"")||"left")==f?e.css("text-align",""):e.css("text-align",f)}b.selectBookmarks(d);
a.execCommand("save");a.notifySelectionChange()}}),b.addCommand(c.Utils.getQueryCmd(d),{exec:function(a){if((a=a.getSelection())&&!a.isInvalid)return a=a.getStartElement(),a=new c.ElementPath(a),a=a.block||a.blockLimit,!a||"body"===a.nodeName()?!1:(a.css("text-align").replace(i,"")||"left")==f}}))}}},{requires:["editor"]});
