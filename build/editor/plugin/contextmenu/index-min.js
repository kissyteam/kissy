/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 13 14:40
*/
KISSY.add("editor/plugin/contextmenu/index",function(h,e,i,j){e.prototype.addContextMenu=function(k,l,a){var c=this,a=a||{};a.prefixCls=c.get("prefixCls")+"editor-";a.editor=c;a.focusable=1;a.zIndex=e.baseZIndex(e.zIndexManager.POPUP_MENU);a.elAttrs={hideFocus:"hideFocus"};a.children&&h.each(a.children,function(a){a.xclass="menuitem"});var b=new i.PopupMenu(a);j.init(b);c.docReady(function(){var a=c.get("document");a.on("mousedown",function(a){1==a.which&&b.hide()});a.delegate("contextmenu",l,function(d){var c=
h.all(d.target);d.halt();var f=d.pageX,g=d.pageY,d=f?e.Utils.getXY(f,g,a[0],document):c.offset(document),f=d.left,g=d.top;setTimeout(function(){b.set("editorSelectedEl",c,{silent:1});b.set("xy",[f,g]);b.show();e.fire("contextmenu",{contextmenu:b});window.focus();document.body.focus();b.get("el")[0].focus()},30)})});c.addControl(k+"/contextmenu",b);return b}},{requires:["editor","menu","../focusFix/"]});
