/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 7 00:48
*/
KISSY.add("editor/plugin/select/index",function(e,d,g){d.prototype.addSelect=function(h,b,i,f){var f=f||g.Select,c=this,j=c.get("prefixCls")+"editor-";b&&(b.editor=c,b.menu&&(b.menu.zIndex=d.baseZIndex(d.zIndexManager.SELECT),b.menu.xclass="popupmenu",e.each(b.menu.children,function(a){a.xclass="option"})));var a=new f(e.mix({elAttrs:{hideFocus:"hideFocus"},render:c.get("toolBarEl"),prefixCls:j,autoRender:!0},b));a.get("el").unselectable();e.mix(a,i);if(a.selectionChange)c.on("selectionChange",function(){c.get("mode")!=
d.SOURCE_MODE&&a.selectionChange.apply(a,arguments)});if(a.click)a.on("click",function(b){a.click.apply(a,arguments);b.halt()});b.mode==d.WYSIWYG_MODE&&(c.on("wysiwygMode",function(){a.set("disabled",false)}),c.on("sourceMode",function(){a.set("disabled",true)}));a.init&&a.init();c.addControl(h,a);return a};return g.Select},{requires:["editor","menubutton"]});
