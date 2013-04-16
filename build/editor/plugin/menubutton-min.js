/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:19
*/
KISSY.add("editor/plugin/menubutton",function(g,c,e){c.prototype.addSelect=function(h,a,d){var d=d||e.Select,f=this.get("prefixCls")+"editor-";if(a&&(a.editor=this,a.menu&&(a.menu.zIndex=c.baseZIndex(c.zIndexManager.SELECT)),a.elCls))a.elCls=f+a.elCls;var b=(new d(g.mix({render:this.get("toolBarEl"),prefixCls:f},a))).render();b.get("el").unselectable();a.mode==c.Mode.WYSIWYG_MODE&&(this.on("wysiwygMode",function(){b.set("disabled",!1)}),this.on("sourceMode",function(){b.set("disabled",!0)}));this.addControl(h+
"/select",b);return b};return e},{requires:["editor","menubutton"]});
