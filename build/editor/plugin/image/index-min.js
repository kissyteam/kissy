/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 30 20:27
*/
KISSY.add("editor/plugin/image/index",function(c,g,n,h,j,k){var i=c.UA,l=c.Node,e=c.all,m=c.Event,d=function(a){a=e(a);return"img"===a.nodeName(a)&&!/(^|\s+)ke_/.test(a[0].className)&&a};return{init:function(a){function c(b){k.useDialog(a,"image/dialog",b)}a.addButton({contentCls:"ke-toolbar-image",title:"插入图片",mode:g.WYSIWYG_MODE},{offClick:function(){c(null)}});j.register({editor:a,filter:d,width:"120px",handlers:{"图片属性":function(){var b=d(this.selectedEl);b&&c(e(b))},"插入新行":function(){var b=a.get("document")[0],
c=new l(b.createElement("p"));i.ie||c._4e_appendBogus(void 0);b=new g.Range(b);b.setStartAfter(this.selectedEl);b.select();a.insertElement(c);b.moveToElementEditablePosition(c,1);b.select()}}});a.docReady(function(){m.on(a.get("document")[0],"dblclick",function(b){b.halt();b=e(b.target);d(b)&&c(b)})});h.register({editor:a,filter:d,init:function(){var b=this,f=b.get("contentEl");f.html('<a class="ke-bubbleview-url" target="_blank" href="#">在新窗口查看</a>  |  <a class="ke-bubbleview-link ke-bubbleview-change" href="#">编辑</a>  |  <a class="ke-bubbleview-link ke-bubbleview-remove" href="#">删除</a>');
var d=f.one(".ke-bubbleview-url"),e=f.one(".ke-bubbleview-change"),h=f.one(".ke-bubbleview-remove");g.Utils.preventFocus(f);e.on("click",function(a){c(b.selectedEl);a.halt()});h.on("click",function(c){if(i.webkit){var d=a.getSelection().getRanges();d&&d[0]&&(d[0].collapse(),d[0].select())}b.selectedEl.remove();b.hide();a.notifySelectionChange();c.halt()});b.on("show",function(){var a=b.selectedEl;a&&(a=a.attr("_ke_saved_src")||a.attr("src"),d.attr("href",a))})}})}}},{requires:["editor","../button/",
"../bubbleview/","../contextmenu/","../dialogLoader/"]});
