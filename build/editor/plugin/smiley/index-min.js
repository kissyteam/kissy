/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 7 15:13
*/
KISSY.add("editor/plugin/smiley/index",function(f,d,g){for(var b="<div class='ks-editor-smiley-sprite'>",c=0;98>=c;c++)b+="<a href='javascript:void(0)' data-icon='http://a.tbcdn.cn/sys/wangwang/smiley/48x48/"+c+".gif'></a>";b+="</div>";return{init:function(c){c.addButton("smiley",{tooltip:"插入表情",checkable:!0,mode:d.WYSIWYG_MODE},{init:function(){var c=this;c.on("blur",function(){setTimeout(function(){c.onClick()},150)})},offClick:function(){var e=this,a;if(!(a=e.smiley))a=e.smiley=new g({content:b,
focus4e:!1,width:"297px",autoRender:!0,elCls:"ks-editor-popup",zIndex:d.baseZIndex(d.zIndexManager.POPUP_MENU),mask:!1}),a.get("el").on("click",function(a){var a=new f.Node(a.target),b;if("a"==a.nodeName()&&(b=a.attr("data-icon")))b=new f.Node("<img alt='' src='"+b+"'/>",null,c.get("document")[0]),c.insertElement(b)}),a.on("hide",function(){e.set("checked",!1)});a.set("align",{node:this.get("el"),points:["bl","tl"]});a.show()},onClick:function(){this.smiley&&this.smiley.hide()},destructor:function(){this.smiley&&
this.smiley.destroy()}})}}},{requires:["editor","../overlay/"]});
