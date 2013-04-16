/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:16
*/
KISSY.add("editor/plugin/element-path",function(c,j){function f(a){this.cfg=a;this._cache=[];this._init()}function e(){}var i=c.Node;c.augment(f,{_init:function(){var a=this.cfg.editor;this.holder=new i("<span>");this.holder.appendTo(a.get("statusBarEl"),void 0);a.on("selectionChange",this._selectionChange,this);j.Utils.sourceDisable(a,this)},disable:function(){this.holder.css("visibility","hidden")},enable:function(){this.holder.css("visibility","")},_selectionChange:function(a){var g=this.cfg.editor,
c=g.get("prefixCls"),f=this.holder,a=a.path.elements,d,b;d=this._cache;for(b=0;b<d.length;b++)d[b].remove();this._cache=[];for(b=0;b<a.length;b++){d=a[b];var e=d.attr("_ke_real_element_type")||d.nodeName(),h=new i("<a href='javascript(\""+e+"\")' class='"+c+"editor-element-path'>"+e+"</a>");this._cache.push(h);(function(a){h.on("click",function(b){b.halt();g.focus();setTimeout(function(){g.getSelection().selectElement(a)},50)})})(d);f.prepend(h)}},destroy:function(){this.holder.remove()}});c.augment(e,
{pluginRenderUI:function(a){var c=new f({editor:a});a.on("destroy",function(){c.destroy()})}});return e},{requires:["editor"]});
