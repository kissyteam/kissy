/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:48
*/
KISSY.add("editor/plugin/progressbar",["base","util","node"],function(f,b,i,h){var f=b("base"),g=b("util"),e=b("node");h.exports=f.extend({destroy:function(){this.detach();this.el.remove()},initializer:function(){var a=this.get("height"),c=this.get("prefixCls"),d=e(g.substitute('<div class="{prefixCls}editor-progressbar"  style="width:'+this.get("width")+";height:"+a+';"></div>',{prefixCls:c})),b=this.get("container"),a=e(g.substitute('<div style="overflow:hidden;"><div class="{prefixCls}editor-progressbar-inner" style="height:'+
(parseInt(a,10)-4)+'px"><div class="{prefixCls}editor-progressbar-inner-bg"></div></div></div>',{prefixCls:c})).appendTo(d),c=e('<span class="'+c+'editor-progressbar-title"></span>').appendTo(d);b&&d.appendTo(b);this.el=d;this._title=c;this._p=a;this.on("afterProgressChange",this._progressChange,this);this._progressChange({newVal:this.get("progress")})},_progressChange:function(a){a=a.newVal;this._p.css("width",a+"%");this._title.html(a+"%")}},{ATTRS:{container:{},width:{},height:{},progress:{value:0},
prefixCls:{value:"ks-"}}})});
