/*
Copyright 2012, KISSY UI Library v1.30rc
MIT Licensed
build time: Aug 22 23:28
*/
KISSY.add("editor/plugin/element-path/index",function(c,j){function e(a){this.cfg=a;this._cache=[];this._init()}function g(){}var h=c.Node;c.augment(e,{_init:function(){var a=this.cfg.editor;this.holder=new h("<span>");this.holder.appendTo(a.get("statusBarEl"),void 0);a.on("selectionChange",this._selectionChange,this);j.Utils.sourceDisable(a,this)},disable:function(){this.holder.css("visibility","hidden")},enable:function(){this.holder.css("visibility","")},_selectionChange:function(a){var i=this.cfg.editor,
c=this.holder,a=a.path.elements,d,b;d=this._cache;for(b=0;b<d.length;b++)d[b].remove();this._cache=[];for(b=0;b<a.length;b++){d=a[b];var e=d.attr("_ke_real_element_type")||d.nodeName(),f=new h("<a href='javascript(\""+e+"\")' class='ks-editor-element-path'>"+e+"</a>");this._cache.push(f);(function(a){f.on("click",function(b){b.halt();i.focus();setTimeout(function(){i.getSelection().selectElement(a)},50)})})(d);c.prepend(f)}},destroy:function(){this.holder.remove()}});c.augment(g,{renderUI:function(a){var c=
new e({editor:a});a.on("destroy",function(){c.destroy()})}});return g},{requires:["editor"]});
