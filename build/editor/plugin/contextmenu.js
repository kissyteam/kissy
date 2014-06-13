/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:44
*/
KISSY.add("editor/plugin/contextmenu",["editor","menu","./focus-fix","event/dom","node"],function(n,a){var g=a("editor"),i=a("menu"),j=a("./focus-fix"),k=a("event/dom"),l=a("node");g.prototype.addContextMenu=function(a,m,c){function h(f){var c=l(f.target),a=f.pageX,e=f.pageY;a&&(f=g.Utils.getXY({left:a,top:e},d),a=f.left,e=f.top,setTimeout(function(){b.set("editorSelectedEl",c,{silent:1});b.move(a,e);d.fire("contextmenu",{contextmenu:b});b.show();window.focus();document.body.focus();b.focus()},30))}
var d=this,c=c||{},e=c.event;e&&delete c.event;c.prefixCls=d.get("prefixCls")+"editor-";c.editor=d;c.focusable=1;c.zIndex=g.baseZIndex(g.ZIndexManager.POPUP_MENU);var b=new i.PopupMenu(c);j.init(b);b.on("afterRenderUI",function(){b.get("el").on("keydown",function(a){a.keyCode===k.KeyCode.ESC&&b.hide()})});d.docReady(function(){var a=d.get("document");a.on("mousedown",function(a){1===a.which&&b.hide()});a.delegate("contextmenu",m,function(a){a.halt();h(a)})});e&&h(e);d.addControl(a+"/contextmenu",
b);return b}});
