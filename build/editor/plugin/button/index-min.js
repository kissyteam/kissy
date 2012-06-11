/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 11 20:22
*/
KISSY.add("editor/plugin/button/index",function(h,f,c){f.prototype.addButton=function(g,d,e){void 0===e&&(e=d.checkable?c.Toggle:c,delete d.checkable);var b=this.get("prefixCls")+"editor-",a=new e(h.mix({render:this.get("toolBarEl"),elAttrs:{hideFocus:"hideFocus"},autoRender:!0,content:'<span class="'+b+"toolbar-item "+b+"toolbar-"+g+'"></span>',elCls:b+"toolbar-button",prefixCls:b,editor:this},d)),i=a.get("el").one("span");a.get("el").unselectable();a.on("afterContentClsChange",function(a){i[0].className=
b+"toolbar-item "+b+"toolbar-"+a.newVal});a.get("mode")==f.WYSIWYG_MODE&&(this.on("wysiwygMode",function(){a.set("disabled",false)}),this.on("sourceMode",function(){a.set("disabled",true)}));this.addControl(g+"/button",a);return a};return c},{requires:["editor","button"]});
