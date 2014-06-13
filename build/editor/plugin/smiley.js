/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:48
*/
KISSY.add("editor/plugin/smiley",["editor","./overlay","./button","node","util"],function(b,a,l,i){function g(){}var f=a("editor"),j=a("./overlay");a("./button");for(var h=a("node"),k=a("util"),e='<div class="{prefixCls}editor-smiley-sprite">',b=0;98>=b;b++)e+='<a href="javascript:void(0)" data-icon="http://a.tbcdn.cn/sys/wangwang/smiley/48x48/'+b+'.gif"></a>';e+="</div>";g.prototype={pluginRenderUI:function(a){var b=a.get("prefixCls");a.addButton("smiley",{tooltip:"\u63d2\u5165\u8868\u60c5",checkable:!0,listeners:{afterSyncUI:function(){var a=
this;a.on("blur",function(){setTimeout(function(){a.smiley&&a.smiley.hide()},150)})},click:function(){var c=this,d;if(c.get("checked")){if(!(d=c.smiley))d=c.smiley=(new j({content:k.substitute(e,{prefixCls:b}),focus4e:!1,width:300,elCls:b+"editor-popup",zIndex:f.baseZIndex(f.ZIndexManager.POPUP_MENU),mask:!1})).render(),d.get("el").on("click",function(b){var b=h(b.target),c;if("a"===b.nodeName()&&(c=b.attr("data-icon")))c=h('<img alt="" src="'+c+'"/>',a.get("document")[0]),a.insertElement(c)}),d.on("hide",
function(){c.set("checked",!1)});d.set("align",{node:this.get("el"),points:["bl","tl"],overflow:{adjustX:1,adjustY:1}});d.show()}else c.smiley&&c.smiley.hide()},destroy:function(){this.smiley&&this.smiley.destroy()}},mode:f.Mode.WYSIWYG_MODE})}};i.exports=g});
