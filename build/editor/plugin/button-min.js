/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:15
*/
KISSY.add("editor/plugin/button",function(h,e,f){e.prototype.addButton=function(g,b,d){void 0===d&&(d=f);var c=this.get("prefixCls")+"editor-toolbar-";b.elCls&&(b.elCls=c+b.elCls);b.elCls=c+"button "+(b.elCls||"");var a=(new d(h.mix({render:this.get("toolBarEl"),content:'<span class="'+c+"item "+c+g+'"></span>',prefixCls:this.get("prefixCls")+"editor-",editor:this},b))).render();a.get("el").unselectable();if(!b.content){var i=a.get("el").one("span");a.on("afterContentClsChange",function(a){i[0].className=
c+"item "+c+a.newVal})}a.get("mode")==e.Mode.WYSIWYG_MODE&&(this.on("wysiwygMode",function(){a.set("disabled",false)}),this.on("sourceMode",function(){a.set("disabled",true)}));this.addControl(g+"/button",a);return a};return f},{requires:["editor","button"]});
