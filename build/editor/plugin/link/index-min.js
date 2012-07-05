/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 5 10:58
*/
KISSY.add("editor/plugin/link/index",function(c,i,l,j,k){function f(a){a=g(a);return a.closest("a",void 0)}function b(a){this.config=a||{}}var g=c.all;c.augment(b,{renderUI:function(a){a.addButton("link",{tooltip:"插入链接",listeners:{click:function(){k.useDialog(a,"link",c.config,void 0)}},mode:i.WYSIWYG_MODE});var c=this;a.addBubble("link",f,{listeners:{afterRenderUI:function(){var d=this,e=d.get("contentEl");e.html('<a href=""  target="_blank" class="ks-editor-bubble-url">在新窗口查看</a>  –   <span class="ks-editor-bubble-link ks-editor-bubble-change">编辑</span>   |    <span class="ks-editor-bubble-link ks-editor-bubble-remove">去除</span>');
var b=e.one(".ks-editor-bubble-url"),f=e.one(".ks-editor-bubble-change"),g=e.one(".ks-editor-bubble-remove");i.Utils.preventFocus(e);f.on("click",function(h){var b=d.get("editorSelectedEl");k.useDialog(a,"link",c.config,b);h.halt()});g.on("click",function(h){j.removeLink(a,d.get("editorSelectedEl"));h.halt()});d.on("show",function(){var a=d.get("editorSelectedEl");a&&(a=a.attr(j._ke_saved_href)||a.attr("href"),b.html(a),b.attr("href",a))})}}})}});return b},{requires:["editor","../bubble/","./utils",
"../dialogLoader/","../button/"]});
