/*
Copyright 2013, KISSY v1.40dev
MIT Licensed
build time: Oct 25 16:46
*/
KISSY.add("editor/plugin/progressbar",function(d,g){var e=d.Node;return g.extend({destroy:function(){this.detach();this.el.remove()},initializer:function(){var a=this.get("height"),b=this.get("prefixCls"),c=new e(d.substitute("<div class='{prefixCls}editor-progressbar'  style='width:"+this.get("width")+";height:"+a+";'></div>",{prefixCls:b})),f=this.get("container"),a=(new e(d.substitute("<div style='overflow:hidden;'><div class='{prefixCls}editor-progressbar-inner' style='height:"+(parseInt(a)-4)+
"px'><div class='{prefixCls}editor-progressbar-inner-bg'></div></div></div>",{prefixCls:b}))).appendTo(c),b=(new e("<span class='"+b+"editor-progressbar-title'></span>")).appendTo(c);f&&c.appendTo(f);this.el=c;this._title=b;this._p=a;this.on("afterProgressChange",this._progressChange,this);this._progressChange({newVal:this.get("progress")})},_progressChange:function(a){a=a.newVal;this._p.css("width",a+"%");this._title.html(a+"%")}},{ATTRS:{container:{},width:{},height:{},progress:{value:0},prefixCls:{value:"ks-"}}})},
{requires:["base"]});
