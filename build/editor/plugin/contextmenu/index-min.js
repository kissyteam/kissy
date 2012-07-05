/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 5 23:29
*/
KISSY.add("editor/plugin/contextmenu/index",function(g,e,j,k){e.prototype.addContextMenu=function(l,m,a){var d=this,a=a||{};a.prefixCls=d.get("prefixCls")+"editor-";a.editor=d;a.focusable=1;a.zIndex=e.baseZIndex(e.zIndexManager.POPUP_MENU);a.elAttrs={hideFocus:"hideFocus"};a.children&&g.each(a.children,function(b){b.xclass="menuitem"});var b=new j.PopupMenu(a);k.init(b);b.on("afterRenderUI",function(){b.get("el").on("keydown",function(a){a.keyCode==g.Event.KeyCodes.ESC&&b.hide()})});d.docReady(function(){var a=
d.get("document");a.on("mousedown",function(a){1==a.which&&b.hide()});a.delegate("contextmenu",m,function(c){var i=g.all(c.target);c.halt();var f=c.pageX,h=c.pageY,c=f?e.Utils.getXY(f,h,a[0],document):i.offset(document),f=c.left,h=c.top;setTimeout(function(){b.set("editorSelectedEl",i,{silent:1});b.set("xy",[f,h]);b.show();d.fire("contextmenu",{contextmenu:b});window.focus();document.body.focus();b.get("el")[0].focus()},30)})});d.addControl(l+"/contextmenu",b);return b}},{requires:["editor","menu",
"../focusFix/"]});
