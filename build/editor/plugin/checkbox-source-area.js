/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:44
*/
KISSY.add("editor/plugin/checkbox-source-area",["editor","util","node"],function(b,c,d,g){function e(a){this.editor=a;this._init()}function f(){}var b=c("editor"),d=c("util"),h=c("node"),i=b.Mode.SOURCE_MODE,j=b.Mode.WYSIWYG_MODE;d.augment(e,{_init:function(){var a=this.editor,b=a.get("statusBarEl");this.holder=h('<span style="zoom:1;display:inline-block;height:22px;line-height:22px;"><label style="vertical-align:middle;"><input style="margin:0 5px;" type="checkbox" />\u7f16\u8f91\u6e90\u4ee3\u7801</label></span>');this.holder.appendTo(b);
(this.el=this.holder.one("input")).on("click",this._check,this);a.on("wysiwygMode",this._wysiwygmode,this);a.on("sourceMode",this._sourcemode,this)},_sourcemode:function(){this.el.attr("checked",!0)},_wysiwygmode:function(){this.el.attr("checked",!1)},_check:function(){var a=this.editor;this.el.attr("checked")?a.set("mode",i):a.set("mode",j)},destroy:function(){this.holder.remove()}});d.augment(f,{pluginRenderUI:function(a){var b=new e(a);a.on("destroy",function(){b.destroy()})}});g.exports=f});
