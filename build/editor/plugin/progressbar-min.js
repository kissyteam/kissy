/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:25
*/
KISSY.add("editor/plugin/progressbar",["base"],function(d,f){return f("base").extend({destroy:function(){this.detach();this.el.remove()},initializer:function(){var a=this.get("height"),b=this.get("prefixCls"),c=new Node(d.substitute('<div class="{prefixCls}editor-progressbar"  style="width:'+this.get("width")+";height:"+a+';"></div>',{prefixCls:b})),e=this.get("container"),a=(new Node(d.substitute('<div style="overflow:hidden;"><div class="{prefixCls}editor-progressbar-inner" style="height:'+(parseInt(a,
10)-4)+'px"><div class="{prefixCls}editor-progressbar-inner-bg"></div></div></div>',{prefixCls:b}))).appendTo(c),b=(new Node('<span class="'+b+'editor-progressbar-title"></span>')).appendTo(c);e&&c.appendTo(e);this.el=c;this._title=b;this._p=a;this.on("afterProgressChange",this._progressChange,this);this._progressChange({newVal:this.get("progress")})},_progressChange:function(a){a=a.newVal;this._p.css("width",a+"%");this._title.html(a+"%")}},{ATTRS:{container:{},width:{},height:{},progress:{value:0},
prefixCls:{value:"ks-"}}})});
