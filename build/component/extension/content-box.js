/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 13:53
*/
KISSY.add("component/extension/content-box",["./content-box/content-xtpl"],function(e,f,g,c){function d(a){var b=a.get("contentEl");a.$contentEl=a.$contentEl=b;a.contentEl=a.contentEl=b[0]}function a(){}e=f("./content-box/content-xtpl");a.prototype={__createDom:function(){d(this)},__decorateDom:function(){d(this)},getChildrenContainerEl:function(){return this.get("contentEl")},_onSetContent:function(a){var b=this.$contentEl;b.html(a);this.get("allowTextSelection")||b.unselectable()}};a.ATTRS={contentTpl:{value:e},
contentEl:{selector:function(){return"."+this.getBaseCssClass("content")}},content:{parse:function(){return this.get("contentEl").html()}}};c.exports=a});
KISSY.add("component/extension/content-box/content-xtpl",[],function(e,f,g,c){c.exports=function(d,a,c){var b=this.root.utils.callFn;a.write('<div class="',0);var e={escape:1},f=[];f.push("content");e.params=f;if((b=b(this,d,e,a,["getBaseCssClasses"],0,1))&&b.isBuffer)a=b,b=c;a.write(b,!0);a.write('">',0);d=d.resolve(["content"],0);a.write(d,!1);a.write("</div>",0);return a};c.exports.TPL_NAME=c.name});
