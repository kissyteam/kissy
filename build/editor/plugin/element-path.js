/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:45
*/
KISSY.add("editor/plugin/element-path",["editor","node"],function(l,e,m,j){function f(a){this.cfg=a;this._cache=[];this._init()}function c(){}var k=e("editor"),i=e("node");f.prototype={_init:function(){var a=this.cfg.editor;this.holder=i("<span>");this.holder.appendTo(a.get("statusBarEl"),void 0);a.on("selectionChange",this._selectionChange,this);k.Utils.sourceDisable(a,this)},disable:function(){this.holder.css("visibility","hidden")},enable:function(){this.holder.css("visibility","")},_selectionChange:function(a){var g=
this.cfg.editor,e=g.get("prefixCls"),f=this.holder,a=a.path.elements,d,b;d=this._cache;for(b=0;b<d.length;b++)d[b].remove();this._cache=[];for(b=0;b<a.length;b++){d=a[b];var c=d.attr("_ke_real_element_type")||d.nodeName(),h=i("<a href=\"javascript('"+c+'\')" class="'+e+'editor-element-path">'+c+"</a>");this._cache.push(h);(function(a){h.on("click",function(b){b.halt();g.focus();setTimeout(function(){g.getSelection().selectElement(a)},50)})})(d);f.prepend(h)}},destroy:function(){this.holder.remove()}};
c.prototype={pluginRenderUI:function(a){var c=new f({editor:a});a.on("destroy",function(){c.destroy()})}};j.exports=c});
