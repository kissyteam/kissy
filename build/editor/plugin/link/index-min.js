/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 13 14:40
*/
KISSY.add("editor/plugin/link/index",function(e,g,l,h,i){function f(b){b=k(b);return b.closest("a",void 0)}var k=e.all;return{init:function(b){b.addButton("link",{tooltip:"插入链接",listeners:{click:function(){i.useDialog(b,"link",void 0)}},mode:g.WYSIWYG_MODE});b.addBubble("link",f,{listeners:{afterRenderUI:function(){var d=this,c=d.get("contentEl");c.html('<a href=""  target="_blank" class="ks-editor-bubble-url">在新窗口查看</a>  –   <span class="ks-editor-bubble-link ks-editor-bubble-change">编辑</span>   |    <span class="ks-editor-bubble-link ks-editor-bubble-remove">去除</span>');
var j=c.one(".ks-editor-bubble-url"),e=c.one(".ks-editor-bubble-change"),f=c.one(".ks-editor-bubble-remove");g.Utils.preventFocus(c);e.on("click",function(a){var c=d.get("editorSelectedEl");i.useDialog(b,"link",c);a.halt()});f.on("click",function(a){h.removeLink(b,d.get("editorSelectedEl"));a.halt()});d.on("show",function(){var a=d.get("editorSelectedEl");a&&(a=a.attr(h._ke_saved_href)||a.attr("href"),j.html(a),j.attr("href",a))})}}})}}},{requires:["editor","../bubble/","./utils","../dialogLoader/",
"../button/"]});
