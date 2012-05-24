/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 24 18:37
*/
KISSY.add("editor/plugin/justifyUtils/cmd",function(k,j){var i=/(-moz-|-webkit-|start|auto)/gi;return{addCommand:function(a,b,f){a.hasCommand(b)||(a.addCommand(b,{exec:function(e){e.execCommand("save");for(var g=e.getSelection(),c=g.createBookmarks(),a=g.getRanges(),b,d,h=a.length-1;0<=h;h--){b=a[h].createIterator();for(b.enlargeBr=!0;d=b.getNextParagraph();)d.removeAttr("align"),(d.css("text-align").replace(i,"")||"left")==f?d.css("text-align",""):d.css("text-align",f)}g.selectBookmarks(c);e.execCommand("save");
e.notifySelectionChange()}}),a.addCommand(j.Utils.getQueryCmd(b),{exec:function(b,a){var c=a.block||a.blockLimit;return!c||"body"===c.nodeName()?!1:(c.css("text-align").replace(i,"")||"left")==f}}))}}},{requires:["editor"]});
