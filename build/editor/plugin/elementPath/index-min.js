/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 28 19:44
*/
KISSY.add("editor/plugin/elementPath/index",function(d,i){function e(a){this.cfg=a;this._cache=[];this._init()}var g=d.Node;d.augment(e,{_init:function(){var a=this.cfg.editor;this.holder=new g("<span>");this.holder.appendTo(a.get("statusBarEl"),void 0);a.on("selectionChange",this._selectionChange,this);i.Utils.sourceDisable(a,this)},disable:function(){this.holder.css("visibility","hidden")},enable:function(){this.holder.css("visibility","")},_selectionChange:function(a){var h=this.cfg.editor,d=this.holder,
a=a.path.elements,c,b;c=this._cache;for(b=0;b<c.length;b++)c[b].remove();this._cache=[];for(b=0;b<a.length;b++){c=a[b];var e=c.attr("_ke_real_element_type")||c.nodeName(),f=new g("<a href='javascript(\""+e+"\")' class='ke-element-path'>"+e+"</a>");this._cache.push(f);(function(a){f.on("click",function(b){b.halt();h.focus();setTimeout(function(){h.getSelection().selectElement(a)},50)})})(c);d.prepend(f)}},destroy:function(){this.holder.remove()}});return{init:function(a){var d=new e({editor:a});a.on("destroy",
function(){d.destroy()})}}},{requires:["editor"]});
