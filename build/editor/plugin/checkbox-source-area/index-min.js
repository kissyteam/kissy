/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Feb 17 17:29
*/
KISSY.add("editor/plugin/checkbox-source-area/index",function(b,c){function d(a){this.editor=a;this._init()}function e(){}var f=b.Node,g=c.SOURCE_MODE,h=c.WYSIWYG_MODE;b.augment(d,{_init:function(){var a=this.editor,b=a.get("statusBarEl");this.holder=(new f("<span style='zoom:1;display:inline-block;height:22px;line-height:22px;'><input style='margin:0 5px;vertical-align:middle;' type='checkbox' /><span style='vertical-align:middle;'>编辑源代码</span></span>")).appendTo(b);(this.el=this.holder.one("input")).on("click",
this._check,this);a.on("wysiwygMode",this._wysiwygmode,this);a.on("sourceMode",this._sourcemode,this)},_sourcemode:function(){this.el.attr("checked",!0)},_wysiwygmode:function(){this.el.attr("checked",!1)},_check:function(){var a=this.editor;this.el.attr("checked")?a.set("mode",g):a.set("mode",h)},destroy:function(){this.holder.remove()}});b.augment(e,{pluginRenderUI:function(a){var b=new d(a);a.on("destroy",function(){b.destroy()})}});return e},{requires:["editor"]});
