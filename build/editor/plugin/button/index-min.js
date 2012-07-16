/*
Copyright 2012, KISSY UI Library v1.30rc
MIT Licensed
build time: Jul 16 11:07
*/
KISSY.add("editor/plugin/button/index",function(g,d,e){d.prototype.addButton=function(f,h,c){void 0===c&&(c=e);var b=this.get("prefixCls")+"editor-",a=new c(g.mix({render:this.get("toolBarEl"),elAttrs:{hideFocus:"hideFocus"},autoRender:!0,content:'<span class="'+b+"toolbar-item "+b+"toolbar-"+f+'"></span>',elCls:b+"toolbar-button",prefixCls:b,editor:this},h)),i=a.get("el").one("span");a.get("el").unselectable();a.on("afterContentClsChange",function(a){i[0].className=b+"toolbar-item "+b+"toolbar-"+
a.newVal});a.get("mode")==d.WYSIWYG_MODE&&(this.on("wysiwygMode",function(){a.set("disabled",!1)}),this.on("sourceMode",function(){a.set("disabled",!0)}));this.addControl(f+"/button",a);return a};return e},{requires:["editor","button"]});
