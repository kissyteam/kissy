/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:20
*/
KISSY.add("editor/plugin/smiley",function(e,g,i){function h(){}for(var d="<div class='{prefixCls}editor-smiley-sprite'>",b=0;98>=b;b++)d+="<a href='javascript:void(0)' data-icon='http://a.tbcdn.cn/sys/wangwang/smiley/48x48/"+b+".gif'></a>";d+="</div>";e.augment(h,{pluginRenderUI:function(f){var b=f.get("prefixCls");f.addButton("smiley",{tooltip:"\u63d2\u5165\u8868\u60c5",checkable:!0,listeners:{afterSyncUI:function(){var a=this;a.on("blur",function(){setTimeout(function(){a.smiley&&a.smiley.hide()},150)})},click:function(){var a=
this,c;if(a.get("checked")){if(!(c=a.smiley))c=a.smiley=(new i({content:e.substitute(d,{prefixCls:b}),focus4e:!1,width:300,elCls:b+"editor-popup",zIndex:g.baseZIndex(g.zIndexManager.POPUP_MENU),mask:!1})).render(),c.get("el").on("click",function(a){var a=new e.Node(a.target),b;if("a"==a.nodeName()&&(b=a.attr("data-icon")))b=new e.Node("<img alt='' src='"+b+"'/>",null,f.get("document")[0]),f.insertElement(b)}),c.on("hide",function(){a.set("checked",!1)});c.set("align",{node:this.get("el"),points:["bl",
"tl"],overflow:{adjustX:1,adjustY:1}});c.show()}else a.smiley&&a.smiley.hide()},destroy:function(){this.smiley&&this.smiley.destroy()}},mode:g.Mode.WYSIWYG_MODE})}});return h},{requires:["editor","./overlay"]});
