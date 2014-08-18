/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:24
*/
KISSY.add("editor/plugin/menubutton",["editor","menubutton"],function(h,b){var c=b("editor"),f=b("menubutton");c.prototype.addSelect=function(b,a,e){var e=e||f.Select,g=this.get("prefixCls")+"editor-";if(a&&(a.editor=this,a.menu&&(a.menu.zIndex=c.baseZIndex(c.ZIndexManager.SELECT)),a.elCls))a.elCls=g+a.elCls;var d=(new e(h.mix({render:this.get("toolBarEl"),prefixCls:g},a))).render();a.mode===c.Mode.WYSIWYG_MODE&&(this.on("wysiwygMode",function(){d.set("disabled",!1)}),this.on("sourceMode",function(){d.set("disabled",
!0)}));this.addControl(b+"/select",d);return d};return f});
