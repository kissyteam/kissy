/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Aug 26 16:04
*/
KISSY.add("component/extension/content-box",["./content-box/content-xtpl"],function(e,f,h,c){function d(a){var b=a.get("contentEl");a.$contentEl=a.$contentEl=b;a.contentEl=a.contentEl=b[0]}function a(){}e=f("./content-box/content-xtpl");a.prototype={__createDom:function(){d(this)},__decorateDom:function(){d(this)},getChildrenContainerEl:function(){return this.get("contentEl")},_onSetContent:function(a){var b=this.$contentEl;b.html(a);this.get("allowTextSelection")||b.unselectable()}};a.ATTRS={contentTpl:{value:e},
contentEl:{selector:function(){return"."+this.getBaseCssClass("content")}},content:{parse:function(){return this.get("contentEl").html()}}};c.exports=a});
KISSY.add("component/extension/content-box/content-xtpl",[],function(e,f,h,c){c.exports=function(d,a,c){var b=this.pos={line:1,col:1},e=this.root.utils.callFn;a.append('<div class="');var f={escape:1},g=[];g.push("content");f.params=g;b.line=1;b.col=33;if((b=e(this,d,f,a,["getBaseCssClasses"]))&&b.isBuffer)a=b,b=c;a.writeEscaped(b);a.append('">');d=d.resolve(["content"]);a.write(d);a.append("</div>");return a};c.exports.TPL_NAME=c.name});
