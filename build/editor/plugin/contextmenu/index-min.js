/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Sep 24 15:22
*/
KISSY.add("editor/plugin/contextmenu/index",function(f,d,g,i){d.prototype.addContextMenu=function(j,k,a){var c=this,a=a||{};a.prefixCls=c.get("prefixCls")+"editor-";a.editor=c;a.focusable=1;a.zIndex=d.baseZIndex(d.zIndexManager.POPUP_MENU);a.children&&f.each(a.children,function(b){b.xclass="menuitem"});var b=new g.PopupMenu(a);i.init(b);b.on("afterRenderUI",function(){b.get("el").on("keydown",function(a){a.keyCode==f.Event.KeyCodes.ESC&&b.hide()})});c.docReady(function(){var a=c.get("document");a.on("mousedown",
function(a){1==a.which&&b.hide()});a.delegate("contextmenu",k,function(a){var g=f.all(a.target);a.halt();var e=a.pageX,h=a.pageY;e&&(a=d.Utils.getXY({left:e,top:h},c),e=a.left,h=a.top,setTimeout(function(){b.set("editorSelectedEl",g,{silent:1});b.set("xy",[e,h]);b.show();c.fire("contextmenu",{contextmenu:b});window.focus();document.body.focus();b.get("el")[0].focus()},30))})});c.addControl(j+"/contextmenu",b);return b}},{requires:["editor","menu","../focus-fix/"]});
