/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:44
*/
KISSY.add("editor/plugin/button",["util","editor","button"],function(j,c,k,e){var i=c("util"),g=c("editor"),h=c("button");g.prototype.addButton=function(c,a,f){void 0===f&&(f=h);var d=this.get("prefixCls")+"editor-toolbar-";a.elCls&&(a.elCls=d+a.elCls);a.elCls=d+"button "+(a.elCls||"");var b=(new f(i.mix({render:this.get("toolBarEl"),content:'<span class="'+d+"item "+d+c+'"></span>',prefixCls:this.get("prefixCls")+"editor-",editor:this},a))).render();if(!a.content){var e=b.get("el").one("span");b.on("afterContentClsChange",
function(a){e[0].className=d+"item "+d+a.newVal})}b.get("mode")===g.Mode.WYSIWYG_MODE&&(this.on("wysiwygMode",function(){b.set("disabled",false)}),this.on("sourceMode",function(){b.set("disabled",true)}));this.addControl(c+"/button",b);return b};e.exports=h});
