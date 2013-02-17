/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Feb 17 17:29
*/
KISSY.add("editor/plugin/contextmenu/index",function(h,d,f,i){d.prototype.addContextMenu=function(j,k,a){var c=this,a=a||{};a.prefixCls=c.get("prefixCls")+"editor-";a.editor=c;a.focusable=1;a.zIndex=d.baseZIndex(d.zIndexManager.POPUP_MENU);var b=new f.PopupMenu(a);i.init(b);b.on("afterRenderUI",function(){b.get("el").on("keydown",function(a){a.keyCode==h.Event.KeyCodes.ESC&&b.hide()})});c.docReady(function(){var a=c.get("document");a.on("mousedown",function(a){1==a.which&&b.hide()});a.delegate("contextmenu",
k,function(a){var f=h.all(a.target);a.halt();var e=a.pageX,g=a.pageY;e&&(a=d.Utils.getXY({left:e,top:g},c),e=a.left,g=a.top,setTimeout(function(){b.set("editorSelectedEl",f,{silent:1});b.set("xy",[e,g]);b.show();c.fire("contextmenu",{contextmenu:b});window.focus();document.body.focus();b.get("el")[0].focus()},30))})});c.addControl(j+"/contextmenu",b);return b}},{requires:["editor","menu","../focus-fix/"]});
