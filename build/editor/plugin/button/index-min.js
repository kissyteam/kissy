/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 7 00:48
*/
KISSY.add("editor/plugin/button/index",function(h,d,e){d.prototype.addButton=function(i,f,j,g){void 0===g&&(g=f.checkable?e.Toggle:e,delete f.checkable);var c=this,b=c.get("prefixCls")+"editor-",a=new g(h.mix({render:c.get("toolBarEl"),elAttrs:{hideFocus:"hideFocus"},autoRender:!0,content:'<span class="'+b+"toolbar-item "+b+"toolbar-"+i+'"></span>',elCls:b+"toolbar-button",prefixCls:b,editor:c},f)),k=a.get("el").one("span");a.get("el").unselectable();a.on("afterContentClsChange",function(a){k[0].className=
b+"toolbar-item "+b+"toolbar-"+a.newVal});h.mix(a,j);a.init&&a.init();if(a.selectionChange)c.on("selectionChange",function(b){c.get("mode")!=d.SOURCE_MODE&&a.selectionChange(b)});if(a.onClick||a.offClick)a.on("click",function(c){var b=a.get("checked"),b=b===true||b===void 0?"offClick":"onClick";if(a[b])a[b](c)});a.get("mode")==d.WYSIWYG_MODE&&(c.on("wysiwygMode",function(){a.set("disabled",false)}),c.on("sourceMode",function(){a.set("disabled",true)}));c.addControl(i,a);return a};return e},{requires:["editor",
"button"]});
