/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 14 22:17
*/
KISSY.add("editor/plugin/button",["util","editor","button"],function(j,c){var h=c("util"),f=c("editor"),g=c("button");f.prototype.addButton=function(c,a,e){void 0===e&&(e=g);var d=this.get("prefixCls")+"editor-toolbar-";a.elCls&&(a.elCls=d+a.elCls);a.elCls=d+"button "+(a.elCls||"");var b=(new e(h.mix({render:this.get("toolBarEl"),content:'<span class="'+d+"item "+d+c+'"></span>',prefixCls:this.get("prefixCls")+"editor-",editor:this},a))).render();if(!a.content){var i=b.get("el").one("span");b.on("afterContentClsChange",
function(a){i[0].className=d+"item "+d+a.newVal})}b.get("mode")===f.Mode.WYSIWYG_MODE&&(this.on("wysiwygMode",function(){b.set("disabled",false)}),this.on("sourceMode",function(){b.set("disabled",true)}));this.addControl(c+"/button",b);return b};return g});
