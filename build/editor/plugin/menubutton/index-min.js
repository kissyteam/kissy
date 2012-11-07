/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Nov 7 18:55
*/
KISSY.add("editor/plugin/menubutton/index",function(e,c,f){c.prototype.addSelect=function(h,a,d){var d=d||f.Select,g=this.get("prefixCls")+"editor-";if(a&&(a.editor=this,a.menu&&(a.menu.zIndex=c.baseZIndex(c.zIndexManager.SELECT),a.menu.xclass="popupmenu",e.each(a.menu.children,function(a){a.xclass="option"})),a.elCls))a.elCls=g+a.elCls;var b=new d(e.mix({render:this.get("toolBarEl"),prefixCls:g,autoRender:!0},a));b.get("el").unselectable();a.mode==c.WYSIWYG_MODE&&(this.on("wysiwygMode",function(){b.set("disabled",
!1)}),this.on("sourceMode",function(){b.set("disabled",!0)}));this.addControl(h+"/select",b);return b};return f},{requires:["editor","menubutton"]});
