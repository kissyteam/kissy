/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:19
*/
KISSY.add("editor/plugin/progressbar",function(b){function a(){a.superclass.constructor.apply(this,arguments);this._init()}var e=b.Node;a.ATTRS={container:{},width:{},height:{},progress:{value:0},prefixCls:{value:"ks-"}};b.extend(a,b.Base,{destroy:function(){this.detach();this.el.remove()},_init:function(){var d=this.get("height"),c=this.get("prefixCls"),a=new e(b.substitute("<div class='{prefixCls}editor-progressbar'  style='width:"+this.get("width")+";height:"+d+";'></div>",{prefixCls:c})),f=this.get("container"),
d=(new e(b.substitute("<div style='overflow:hidden;'><div class='{prefixCls}editor-progressbar-inner' style='height:"+(parseInt(d)-4)+"px'><div class='{prefixCls}editor-progressbar-inner-bg'></div></div></div>",{prefixCls:c}))).appendTo(a),c=(new e("<span class='"+c+"editor-progressbar-title'></span>")).appendTo(a);f&&a.appendTo(f);this.el=a;this._title=c;this._p=d;this.on("afterProgressChange",this._progressChange,this);this._progressChange({newVal:this.get("progress")})},_progressChange:function(a){a=
a.newVal;this._p.css("width",a+"%");this._title.html(a+"%")}});return a});
