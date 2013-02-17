/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Feb 17 17:29
*/
KISSY.add("editor/plugin/link/index",function(f,j,n,k,l){function g(a){a=h(a);return a.closest("a",void 0)}function c(a){this.config=a||{}}var h=f.all;f.augment(c,{pluginRenderUI:function(a){var e=a.get("prefixCls");a.addButton("link",{tooltip:"插入链接",listeners:{click:function(){l.useDialog(a,"link",c.config,void 0)}},mode:j.WYSIWYG_MODE});var c=this;a.addBubble("link",g,{listeners:{afterRenderUI:function(){var d=this,b=d.get("contentEl");b.html(f.substitute('<a href=""  target="_blank" class="{prefixCls}editor-bubble-url">在新窗口查看</a>  –   <span class="{prefixCls}editor-bubble-link {prefixCls}editor-bubble-change">编辑</span>   |    <span class="{prefixCls}editor-bubble-link {prefixCls}editor-bubble-remove">去除</span>',
{prefixCls:e}));var m=b.one("."+e+"editor-bubble-url"),g=b.one("."+e+"editor-bubble-change"),h=b.one("."+e+"editor-bubble-remove");j.Utils.preventFocus(b);g.on("click",function(i){var b=d.get("editorSelectedEl");l.useDialog(a,"link",c.config,b);i.halt()});h.on("click",function(i){k.removeLink(a,d.get("editorSelectedEl"));i.halt()});d.on("show",function(){var a=d.get("editorSelectedEl");a&&(a=a.attr(k._ke_saved_href)||a.attr("href"),m.html(a),m.attr("href",a))})}}})}});return c},{requires:["editor",
"../bubble/","./utils","../dialog-loader/","../button/"]});
