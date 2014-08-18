/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:19
*/
KISSY.add("editor/plugin/button",["editor","button"],function(h,d){var f=d("editor"),g=d("button");f.prototype.addButton=function(d,a,e){void 0===e&&(e=g);var c=this.get("prefixCls")+"editor-toolbar-";a.elCls&&(a.elCls=c+a.elCls);a.elCls=c+"button "+(a.elCls||"");var b=(new e(h.mix({render:this.get("toolBarEl"),content:'<span class="'+c+"item "+c+d+'"></span>',prefixCls:this.get("prefixCls")+"editor-",editor:this},a))).render();if(!a.content){var i=b.get("el").one("span");b.on("afterContentClsChange",
function(a){i[0].className=c+"item "+c+a.newVal})}b.get("mode")===f.Mode.WYSIWYG_MODE&&(this.on("wysiwygMode",function(){b.set("disabled",false)}),this.on("sourceMode",function(){b.set("disabled",true)}));this.addControl(d+"/button",b);return b};return g});
