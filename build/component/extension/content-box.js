/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Aug 22 16:02
*/
KISSY.add("component/extension/content-box",["./content-box/content-xtpl"],function(e,f,g,c){function d(a){var b=a.get("contentEl");a.$contentEl=a.$contentEl=b;a.contentEl=a.contentEl=b[0]}function a(){}e=f("./content-box/content-xtpl");a.prototype={__createDom:function(){d(this)},__decorateDom:function(){d(this)},getChildrenContainerEl:function(){return this.get("contentEl")},_onSetContent:function(a){var b=this.$contentEl;b.html(a);this.get("allowTextSelection")||b.unselectable()}};a.ATTRS={contentTpl:{value:e},
contentEl:{selector:function(){return"."+this.getBaseCssClass("content")}},content:{parse:function(){return this.get("contentEl").html()}}};c.exports=a});
KISSY.add("component/extension/content-box/content-xtpl",[],function(e,f,g,c){c.exports=function(d,a,c){var b=this.root.utils.callFn;a.write('<div class="');var e={escape:1},f=[];f.push("content");e.params=f;if((b=b(this,d,e,a,["getBaseCssClasses"],1))&&b.isBuffer)a=b,b=c;a.writeEscaped(b);a.write('">');d=d.resolve(["content"]);a.write(d);a.write("</div>");return a};c.exports.TPL_NAME=c.name});
