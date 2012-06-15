/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 15 12:07
*/
KISSY.add("editor/plugin/bubble/index",function(e,p,i){function q(l){var h=null,d=l.get("editor").getControls();e.each(d,function(c){var a;if(a=c.get)if(a=-1!=(c.get("elCls")||"").indexOf("bubble"))if(a=c!==l)if(a=c.get("visible")){a=l.get("y");var d=a+l.get("el").outerHeight(),e=c.get("y"),g=e+c.get("el").outerHeight();a=a<=g&&d>=g||a<=e&&d>=e}a&&(h?h.get("y")<c.get("y")&&(h=c):h=c);return h})}var n=e.Event,m={}.a,o=e.DOM,s={zIndex:i.baseZIndex(i.zIndexManager.BUBBLE_VIEW),elCls:"ks-editor-bubble",
prefixCls:"ks-editor-",effect:{effect:"fade",duration:0.3}};i.prototype.addBubble=function(l,h,d){function c(){f.hide();var b=g.get("window")[0];n.remove(b,"scroll",i)}function a(){var b;var a=f,c=a.get("editorSelectedEl");if(c){var a=a.get("editor"),e=a.get("window")[0],d=a.get("iframe").offset(),a=d.top,d=d.left,g=d+o.width(e),e=a+o.height(e),j=c.offset(m,window),h=j.top,j=j.left,i=j+c.width(),c=h+c.height(),k;c>e&&h<e?k=e-30:c>a&&c<e&&(k=c);i>d&&j<d?b=d:j>d&&j<g&&(b=j);b=b!==m&&k!==m?[b,k]:m}else b=
m;if(b){f.set("xy",b);if(k=q(f))b[1]=k.get("y")+k.get("el").outerHeight(),f.set("xy",b);f.get("visible")||f.show()}}function i(){f.get("editorSelectedEl")&&(f.get("el"),f.hide(),t())}function r(){var b=g.get("window")[0];n.on(b,"scroll",i);a()}var g=this,f,d=d||{};d.editor=g;e.mix(d,s);f=new p(d);g.addControl(l+"/bubble",f);g.on("selectionChange",function(b){var b=b.path,a=b.elements;if(b&&a&&(b=b.lastElement))(b=h(b))?(f.set("editorSelectedEl",b),f.hide(),e.later(r,10)):c()});g.on("sourceMode",c);
var t=e.buffer(a,350)}},{requires:["overlay","editor"]});
