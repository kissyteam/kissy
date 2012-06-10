/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 10 21:07
*/
KISSY.add("editor/plugin/checkboxSourcearea/index",function(c,d){function e(a){this.editor=a;this._init()}var f=c.Node,g=d.SOURCE_MODE,h=d.WYSIWYG_MODE;c.augment(e,{_init:function(){var a=this.editor,b=a.get("statusBarEl");this.holder=(new f("<span style='zoom:1;display:inline-block;height:22px;line-height:22px;'><input style='margin:0 5px;vertical-align:middle;' type='checkbox' /><span style='vertical-align:middle;'>编辑源代码</span></span>")).appendTo(b);(this.el=this.holder.one("input")).on("click",
this._check,this);a.on("wysiwygMode",this._wysiwygmode,this);a.on("sourceMode",this._sourcemode,this)},_sourcemode:function(){this.el.attr("checked",!0)},_wysiwygmode:function(){this.el.attr("checked",!1)},_check:function(){var a=this.editor;this.el.attr("checked")?a.set("mode",g):a.set("mode",h)},destroy:function(){this.holder.remove()}});return{init:function(a){var b=new e(a);a.on("destroy",function(){b.destroy()})}}},{requires:["editor"]});
