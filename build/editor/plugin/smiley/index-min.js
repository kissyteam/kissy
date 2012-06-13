/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 13 14:40
*/
KISSY.add("editor/plugin/smiley/index",function(f,e,g){for(var d="<div class='ks-editor-smiley-sprite'>",c=0;98>=c;c++)d+="<a href='javascript:void(0)' data-icon='http://a.tbcdn.cn/sys/wangwang/smiley/48x48/"+c+".gif'></a>";d+="</div>";return{init:function(c){c.addButton("smiley",{tooltip:"插入表情",checkable:!0,listeners:{afterSyncUI:function(){var a=this;a.on("blur",function(){setTimeout(function(){a.smiley&&a.smiley.hide()},150)})},click:function(){var a=this,b;if(a.get("checked")){if(!(b=a.smiley))b=
a.smiley=new g({content:d,focus4e:!1,width:"297px",autoRender:!0,elCls:"ks-editor-popup",zIndex:e.baseZIndex(e.zIndexManager.POPUP_MENU),mask:!1}),b.get("el").on("click",function(a){var a=new f.Node(a.target),b;if("a"==a.nodeName()&&(b=a.attr("data-icon")))b=new f.Node("<img alt='' src='"+b+"'/>",null,c.get("document")[0]),c.insertElement(b)}),b.on("hide",function(){a.set("checked",!1)});b.set("align",{node:this.get("el"),points:["bl","tl"]});b.show()}else a.smiley&&a.smiley.hide()},destroy:function(){this.smiley&&
this.smiley.destroy()}},mode:e.WYSIWYG_MODE})}}},{requires:["editor","../overlay/"]});
