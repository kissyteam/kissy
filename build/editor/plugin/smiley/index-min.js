/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 30 21:24
*/
KISSY.add("editor/plugin/smiley/index",function(e,d,f){for(var a="<div class='ks-editor-smiley-sprite'>",c=0;98>=c;c++)a+="<a href='javascript:void(0)' data-icon='http://a.tbcdn.cn/sys/wangwang/smiley/48x48/"+c+".gif'></a>";a+="</div>";return{init:function(c){c.addButton({contentCls:"ks-editor-toolbar-smiley",title:"插入表情",keepFocus:!1,mode:d.WYSIWYG_MODE},{init:function(){var b=this;b.get("el").on("blur",function(){b.smiley&&setTimeout(function(){b.smiley.hide()},100)})},offClick:function(){this.smiley||
(this.smiley=new f({content:a,focus4e:!1,width:"297px",autoRender:!0,elCls:"ks-editor-popup",zIndex:d.baseZIndex(d.zIndexManager.POPUP_MENU),mask:!1}),this.smiley.get("el").on("click",function(b){var b=new e.Node(b.target),a;if("a"==b.nodeName()&&(a=b.attr("data-icon")))a=new e.Node("<img alt='' src='"+a+"'/>",null,c.get("document")[0]),c.insertElement(a)}));this.smiley.set("align",{node:this.get("el"),points:["bl","tl"]});this.smiley.show()},onClick:function(){this.smiley.hide()},destructor:function(){this.smiley&&
this.smiley.destroy()}})}}},{requires:["editor","../overlay/"]});
