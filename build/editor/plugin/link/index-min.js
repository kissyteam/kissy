/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 28 19:44
*/
KISSY.add("editor/plugin/link/index",function(e,g,f,h,i){function k(b){b=l(b);return b.closest("a",void 0)}var l=e.all;return{init:function(b){b.addButton({contentCls:"ke-toolbar-link",title:"插入链接",mode:g.WYSIWYG_MODE},{offClick:function(){i.useDialog(b,"link/dialog",void 0)}});f.register({editor:b,filter:k,init:function(){var c=this,d=c.get("contentEl");d.html('<a href=""  target="_blank" class="ke-bubbleview-url">在新窗口查看</a>  –   <span class="ke-bubbleview-link ke-bubbleview-change">编辑</span>   |    <span class="ke-bubbleview-link ke-bubbleview-remove">去除</span>');
var j=d.one(".ke-bubbleview-url"),e=d.one(".ke-bubbleview-change"),f=d.one(".ke-bubbleview-remove");g.Utils.preventFocus(d);e.on("click",function(a){i.useDialog(b,"link/dialog",c.selectedEl);a.halt()});f.on("click",function(a){h.removeLink(b,c.selectedEl);a.halt()});c.on("show",function(){var a=c.selectedEl;a&&(a=a.attr(h._ke_saved_href)||a.attr("href"),j.html(a),j.attr("href",a))})}})}}},{requires:["editor","../bubbleview/","./utils","../dialogLoader/"]});
