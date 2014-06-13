/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:47
*/
KISSY.add("editor/plugin/menubutton",["editor","util","menubutton"],function(j,b,k,h){var c=b("editor"),i=b("util"),f=b("menubutton");c.prototype.addSelect=function(b,a,e){var e=e||f.Select,g=this.get("prefixCls")+"editor-";if(a&&(a.editor=this,a.menu&&(a.menu.zIndex=c.baseZIndex(c.ZIndexManager.SELECT)),a.elCls))a.elCls=g+a.elCls;var d=(new e(i.mix({render:this.get("toolBarEl"),prefixCls:g},a))).render();a.mode===c.Mode.WYSIWYG_MODE&&(this.on("wysiwygMode",function(){d.set("disabled",!1)}),this.on("sourceMode",
function(){d.set("disabled",!0)}));this.addControl(b+"/select",d);return d};h.exports=f});
