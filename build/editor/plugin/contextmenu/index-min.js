/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 7 15:13
*/
KISSY.add("editor/plugin/contextmenu/index",function(g,d,i,j){d.prototype.addContextMenu=function(k,l,a){a=a||{};a.prefixCls=this.get("prefixCls")+"editor-";a.editor=this;a.focusable=1;a.zIndex=d.baseZIndex(d.zIndexManager.POPUP_MENU);a.elAttrs={hideFocus:"hideFocus"};a.children&&g.each(a.children,function(a){a.xclass="menuitem"});var b=new i.PopupMenu(a);j.init(b);editor.docReady(function(){var a=editor.get("document");a.on("mousedown",function(a){1==a.button&&b.hide()});a.delegate("contextmenu",
l,function(c){var h=g.all(c.target);c.halt();var e=c.pageX,f=c.pageY,c=e?d.Utils.getXY(e,f,a[0],document):h.offset(document),e=c.left,f=c.top;setTimeout(function(){b.set("editorSelectedEl",h,{silent:1});b.set("xy",[e,f]);b.show();d.fire("contextmenu",{contextmenu:b});window.focus();document.body.focus();b.get("el")[0].focus()},30)})});editor.addControl(k,b);return b}},{requires:["editor","menu","../focusFix/"]});
