/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 25 18:18
*/
KISSY.add("editor/plugin/smiley/index",function(e,f,h){function g(){}for(var d="<div class='ks-editor-smiley-sprite'>",c=0;98>=c;c++)d+="<a href='javascript:void(0)' data-icon='http://a.tbcdn.cn/sys/wangwang/smiley/48x48/"+c+".gif'></a>";d+="</div>";e.augment(g,{renderUI:function(c){c.addButton("smiley",{tooltip:"插入表情",checkable:!0,listeners:{afterSyncUI:function(){var a=this;a.on("blur",function(){setTimeout(function(){a.smiley&&a.smiley.hide()},150)})},click:function(){var a=this,b;if(a.get("checked")){if(!(b=
a.smiley))b=a.smiley=new h({content:d,focus4e:!1,width:"297px",autoRender:!0,elCls:"ks-editor-popup",zIndex:f.baseZIndex(f.zIndexManager.POPUP_MENU),mask:!1}),b.get("el").on("click",function(a){var a=new e.Node(a.target),b;if("a"==a.nodeName()&&(b=a.attr("data-icon")))b=new e.Node("<img alt='' src='"+b+"'/>",null,c.get("document")[0]),c.insertElement(b)}),b.on("hide",function(){a.set("checked",!1)});b.set("align",{node:this.get("el"),points:["bl","tl"]});b.show()}else a.smiley&&a.smiley.hide()},destroy:function(){this.smiley&&
this.smiley.destroy()}},mode:f.WYSIWYG_MODE})}});return g},{requires:["editor","../overlay/"]});
