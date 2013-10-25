/*
Copyright 2013, KISSY v1.40dev
MIT Licensed
build time: Oct 25 16:42
*/
KISSY.add("editor/plugin/contextmenu",function(i,f,j,k,l){f.prototype.addContextMenu=function(m,n,a){function h(e){var a=i.all(e.target),g=e.pageX,d=e.pageY;g&&(e=f.Utils.getXY({left:g,top:d},c),g=e.left,d=e.top,setTimeout(function(){b.set("editorSelectedEl",a,{silent:1});b.move(g,d);c.fire("contextmenu",{contextmenu:b});b.show();window.focus();document.body.focus();b.focus()},30))}var c=this,a=a||{},d=a.event;d&&delete a.event;a.prefixCls=c.get("prefixCls")+"editor-";a.editor=c;a.focusable=1;a.zIndex=
f.baseZIndex(f.ZIndexManager.POPUP_MENU);var b=new j.PopupMenu(a);k.init(b);b.on("afterRenderUI",function(){b.get("el").on("keydown",function(a){a.keyCode==l.KeyCode.ESC&&b.hide()})});c.docReady(function(){var a=c.get("document");a.on("mousedown",function(a){1==a.which&&b.hide()});a.delegate("contextmenu",n,function(a){a.halt();h(a)})});d&&h(d);c.addControl(m+"/contextmenu",b);return b}},{requires:["editor","menu","./focus-fix","event"]});
