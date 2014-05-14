/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 14 22:17
*/
KISSY.add("editor/plugin/checkbox-source-area",["editor","util","node"],function(j,b){function c(a){this.editor=a;this._init()}function d(){}var e=b("editor"),f=b("util"),g=b("node"),h=e.Mode.SOURCE_MODE,i=e.Mode.WYSIWYG_MODE;f.augment(c,{_init:function(){var a=this.editor,b=a.get("statusBarEl");this.holder=new g('<span style="zoom:1;display:inline-block;height:22px;line-height:22px;"><label style="vertical-align:middle;"><input style="margin:0 5px;" type="checkbox" />\u7f16\u8f91\u6e90\u4ee3\u7801</label></span>');this.holder.appendTo(b);
(this.el=this.holder.one("input")).on("click",this._check,this);a.on("wysiwygMode",this._wysiwygmode,this);a.on("sourceMode",this._sourcemode,this)},_sourcemode:function(){this.el.attr("checked",!0)},_wysiwygmode:function(){this.el.attr("checked",!1)},_check:function(){var a=this.editor;this.el.attr("checked")?a.set("mode",h):a.set("mode",i)},destroy:function(){this.holder.remove()}});f.augment(d,{pluginRenderUI:function(a){var b=new c(a);a.on("destroy",function(){b.destroy()})}});return d});
