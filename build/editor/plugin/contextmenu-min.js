/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: May 23 00:45
*/
KISSY.add("editor/plugin/contextmenu",function(h,f,j,k){f.prototype.addContextMenu=function(l,m,a){function i(e){var a=h.all(e.target),g=e.pageX,d=e.pageY;g&&(e=f.Utils.getXY({left:g,top:d},c),g=e.left,d=e.top,setTimeout(function(){b.set("editorSelectedEl",a,{silent:1});b.set("xy",[g,d]);c.fire("contextmenu",{contextmenu:b});b.show();window.focus();document.body.focus();b.focus()},30))}var c=this,a=a||{},d=a.event;d&&delete a.event;a.prefixCls=c.prefixCls+"editor-";a.editor=c;a.focusable=1;a.zIndex=
f.baseZIndex(f.zIndexManager.POPUP_MENU);var b=new j.PopupMenu(a);k.init(b);b.on("afterRenderUI",function(){b.get("el").on("keydown",function(a){a.keyCode==h.Event.KeyCodes.ESC&&b.hide()})});c.docReady(function(){var a=c.get("document");a.on("mousedown",function(a){1==a.which&&b.hide()});a.delegate("contextmenu",m,function(a){a.halt();i(a)})});d&&i(d);c.addControl(l+"/contextmenu",b);return b}},{requires:["editor","menu","./focus-fix"]});
