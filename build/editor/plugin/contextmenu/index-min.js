/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 18 22:02
*/
KISSY.add("editor/plugin/contextmenu/index",function(h,e,j,k){e.prototype.addContextMenu=function(l,m,a){var d=this,a=a||{};a.prefixCls=d.get("prefixCls")+"editor-";a.editor=d;a.focusable=1;a.zIndex=e.baseZIndex(e.zIndexManager.POPUP_MENU);a.elAttrs={hideFocus:"hideFocus"};a.children&&h.each(a.children,function(a){a.xclass="menuitem"});var b=new j.PopupMenu(a);k.init(b);d.docReady(function(){var a=d.get("document");a.on("mousedown",function(a){1==a.which&&b.hide()});a.delegate("contextmenu",m,function(c){var i=
h.all(c.target);c.halt();var f=c.pageX,g=c.pageY,c=f?e.Utils.getXY(f,g,a[0],document):i.offset(document),f=c.left,g=c.top;setTimeout(function(){b.set("editorSelectedEl",i,{silent:1});b.set("xy",[f,g]);b.show();d.fire("contextmenu",{contextmenu:b});window.focus();document.body.focus();b.get("el")[0].focus()},30)})});d.addControl(l+"/contextmenu",b);return b}},{requires:["editor","menu","../focusFix/"]});
