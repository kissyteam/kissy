/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: May 23 00:44
*/
KISSY.add("editor/plugin/button",function(h,e,f){e.prototype.addButton=function(g,a,d){void 0===d&&(d=f);var c=this.prefixCls+"editor-toolbar-";a.elCls&&(a.elCls=c+a.elCls);a.elCls=c+"button "+(a.elCls||"");var b=(new d(h.mix({render:this.get("toolBarEl"),content:'<span class="'+c+"item "+c+g+'"></span>',prefixCls:this.prefixCls+"editor-",editor:this},a))).render();if(!a.content){var i=b.get("el").one("span");b.on("afterContentClsChange",function(a){i[0].className=c+"item "+c+a.newVal})}b.get("mode")==
e.Mode.WYSIWYG_MODE&&(this.on("wysiwygMode",function(){b.set("disabled",false)}),this.on("sourceMode",function(){b.set("disabled",true)}));this.addControl(g+"/button",b);return b};return f},{requires:["editor","button"]});
