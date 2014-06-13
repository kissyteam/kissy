/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:47
*/
KISSY.add("editor/plugin/link","./button,./bubble,util,editor,./link/utils,./dialog-loader,node".split(","),function(n,a,o,f){function g(b){b=l(b);return b.closest("a",void 0)}function d(b){this.config=b||{}}a("./button");a("./bubble");var m=a("util"),h=a("editor"),i=a("./link/utils"),j=a("./dialog-loader"),l=a("node");d.prototype={pluginRenderUI:function(b){var a=b.get("prefixCls");b.addButton("link",{tooltip:"\u63d2\u5165\u94fe\u63a5",listeners:{click:function(){j.useDialog(b,"link",d.config,void 0)}},mode:h.Mode.WYSIWYG_MODE});
var d=this;b.addBubble("link",g,{listeners:{afterRenderUI:function(){var e=this,c=e.get("contentEl");c.html(m.substitute('<a href=""  target="_blank" class="{prefixCls}editor-bubble-url">\u5728\u65b0\u7a97\u53e3\u67e5\u770b</a>  \u2013   <span class="{prefixCls}editor-bubble-link {prefixCls}editor-bubble-change">\u7f16\u8f91</span>   |    <span class="{prefixCls}editor-bubble-link {prefixCls}editor-bubble-remove">\u53bb\u9664</span>',{prefixCls:a}));var k=c.one("."+a+"editor-bubble-url"),f=c.one("."+a+"editor-bubble-change"),g=c.one("."+a+"editor-bubble-remove");
h.Utils.preventFocus(c);f.on("click",function(a){var c=e.get("editorSelectedEl");j.useDialog(b,"link",d.config,c);a.halt()});g.on("click",function(a){i.removeLink(b,e.get("editorSelectedEl"));a.halt()});e.on("show",function(){var a=e.get("editorSelectedEl");if(a){a=a.attr(i.savedHref)||a.attr("href");k.html(a);k.attr("href",a)}})}}})}};f.exports=d});
