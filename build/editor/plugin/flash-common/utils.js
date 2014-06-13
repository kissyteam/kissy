/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:45
*/
KISSY.add("editor/plugin/flash-common/utils",["swf","dom","node"],function(h,d,i,f){var e=d("swf"),b=d("dom"),g=d("node");f.exports={insertFlash:function(a,c,b,d,e){c=this.createSWF({src:c,attrs:b,document:a.get("document")[0]});b=a.createFakeElement(c.el,d||"ke_flash",e||"flash",!0,c.html,b);a.insertElement(b);return b},isFlashEmbed:function(a){return"application/x-shockwave-flash"===b.attr(a,"type")||/\.swf(?:$|\?)/i.test(b.attr(a,"src")||"")},getUrl:function(a){return e.getSrc(a)},createSWF:function(a){var c=
b.create('<div style="position:absolute;left:-9999px;top:-9999px;"></div>',void 0,a.document);a.htmlMode="full";b.append(c,a.document.body);a.render=c;a=new e(a);b.remove(c);return{el:g(a.get("el")),html:a.get("html")}}}});
