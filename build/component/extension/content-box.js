/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 14 22:14
*/
KISSY.add("component/extension/content-box",["./content-box/content-xtpl"],function(b,h){function g(a){var d=a.get("contentEl");a.$contentEl=a.$contentEl=d;a.contentEl=a.contentEl=d[0]}function c(){}var e=h("./content-box/content-xtpl");c.prototype={__createDom:function(){g(this)},__decorateDom:function(){g(this)},getChildrenContainerEl:function(){return this.get("contentEl")},_onSetContent:function(a){var d=this.$contentEl;d.html(a);this.get("allowTextSelection")||d.unselectable()}};c.ATTRS={contentTpl:{value:e},
contentEl:{selector:function(){return"."+this.getBaseCssClass("content")}},content:{parse:function(){return this.get("contentEl").html()}}};return c});
KISSY.add("component/extension/content-box/content-xtpl",[],function(b,h,g,c){b=function(e,a,d){var f=this.root.utils.callFn;a.write('<div class="',0);var b={escape:1},c=[];c.push("content");b.params=c;if((f=f(this,e,b,a,["getBaseCssClasses"],0,1))&&f.isBuffer)a=f,f=d;a.write(f,!0);a.write('">',0);e=e.resolve(["content"],0);a.write(e,!1);a.write("</div>",0);return a};b.TPL_NAME=c.name;b.version="5.0.0";return b});
