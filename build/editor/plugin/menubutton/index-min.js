/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 11 20:22
*/
KISSY.add("editor/plugin/menubutton/index",function(e,c,f){c.prototype.addSelect=function(g,a,d){var d=d||f.Select,h=this.get("prefixCls")+"editor-";a&&(a.editor=this,a.menu&&(a.menu.zIndex=c.baseZIndex(c.zIndexManager.SELECT),a.menu.xclass="popupmenu",e.each(a.menu.children,function(a){a.xclass="option"})));var b=new d(e.mix({elAttrs:{hideFocus:"hideFocus"},render:this.get("toolBarEl"),prefixCls:h,autoRender:!0},a));b.get("el").unselectable();a.mode==c.WYSIWYG_MODE&&(this.on("wysiwygMode",function(){b.set("disabled",
false)}),this.on("sourceMode",function(){b.set("disabled",true)}));this.addControl(g+"/select",b);return b};return f},{requires:["editor","menubutton"]});
