/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 31 22:01
*/
KISSY.add("editor/plugin/overlay/index",function(c,a,d,e){var b=d.extend([e],{},{ATTRS:{prefixCls:{value:"ks-editor-"},zIndex:{value:a.baseZIndex(a.zIndexManager.OVERLAY)}}});b.Dialog=d.Dialog.extend([e],{show:function(){this.center();var a=this.get("y");200<a-c.DOM.scrollTop()&&(a=c.DOM.scrollTop()+200,this.set("y",a));b.prototype.show.call(this)}},{ATTRS:{prefixCls:{value:"ks-editor-"},draggable:{value:!0},constrain:{value:!0},aria:{value:!0},zIndex:{value:a.baseZIndex(a.zIndexManager.OVERLAY)}}});
return b},{requires:["editor","overlay","./focus","dd"]});
