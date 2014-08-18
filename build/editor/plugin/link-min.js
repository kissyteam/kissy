/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:23
*/
KISSY.add("editor/plugin/link",["./button","./bubble","editor","./link/utils","./dialog-loader"],function(f,a){function g(b){b=h(b);return b.closest("a",void 0)}function d(b){this.config=b||{}}a("./button");a("./bubble");var i=a("editor"),j=a("./link/utils"),k=a("./dialog-loader"),h=f.all;f.augment(d,{pluginRenderUI:function(b){var a=b.get("prefixCls");b.addButton("link",{tooltip:"\u63d2\u5165\u94fe\u63a5",listeners:{click:function(){k.useDialog(b,"link",d.config,void 0)}},mode:i.Mode.WYSIWYG_MODE});var d=this;b.addBubble("link",
g,{listeners:{afterRenderUI:function(){var e=this,c=e.get("contentEl");c.html(f.substitute('<a href=""  target="_blank" class="{prefixCls}editor-bubble-url">\u5728\u65b0\u7a97\u53e3\u67e5\u770b</a>  \u2013   <span class="{prefixCls}editor-bubble-link {prefixCls}editor-bubble-change">\u7f16\u8f91</span>   |    <span class="{prefixCls}editor-bubble-link {prefixCls}editor-bubble-remove">\u53bb\u9664</span>',{prefixCls:a}));var l=c.one("."+a+"editor-bubble-url"),g=c.one("."+a+"editor-bubble-change"),h=c.one("."+a+"editor-bubble-remove");i.Utils.preventFocus(c);
g.on("click",function(a){var c=e.get("editorSelectedEl");k.useDialog(b,"link",d.config,c);a.halt()});h.on("click",function(a){j.removeLink(b,e.get("editorSelectedEl"));a.halt()});e.on("show",function(){var a=e.get("editorSelectedEl");a&&(a=a.attr(j.savedHref)||a.attr("href"),l.html(a),l.attr("href",a))})}}})}});return d});
