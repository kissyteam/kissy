/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 1 22:57
*/
KISSY.add("component/extension/content-box",["./content-box/content-xtpl"],function(c,f,g,d){function e(a){var b=a.get("contentEl");a.$contentEl=a.$contentEl=b;a.contentEl=a.contentEl=b[0]}function a(){}c=f("./content-box/content-xtpl");a.prototype={__createDom:function(){e(this)},__decorateDom:function(){e(this)},getChildrenContainerEl:function(){return this.get("contentEl")},_onSetContent:function(a){var b=this.$contentEl;b.html(a);this.get("allowTextSelection")||b.unselectable()}};a.ATTRS={contentTpl:{value:c},
contentEl:{selector:function(){return"."+this.getBaseCssClass("content")}},content:{parse:function(){return this.get("contentEl").html()}}};d.exports=a});
KISSY.add("component/extension/content-box/content-xtpl",[],function(c,f,g,d){c=function(e,a,c){var b=this.root.utils.callFn;a.write('<div class="',0);var d={escape:1},f=[];f.push("content");d.params=f;if((b=b(this,e,d,a,["getBaseCssClasses"],0,1))&&b.isBuffer)a=b,b=c;a.write(b,!0);a.write('">',0);e=e.resolve(["content"],0);a.write(e,!1);a.write("</div>",0);return a};c.TPL_NAME=d.name;d.exports=c});
