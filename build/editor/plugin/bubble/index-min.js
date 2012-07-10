/*
Copyright 2012, KISSY UI Library v1.30rc
MIT Licensed
build time: Jul 10 10:47
*/
KISSY.add("editor/plugin/bubble/index",function(f,q,l){function r(j){var i=null,d=j.get("editor").getControls();f.each(d,function(b){var c;if(c=b.get)if(c=-1!=(b.get("elCls")||"").indexOf("bubble"))if(c=b!==j)if(c=b.get("visible")){c=j.get("y");var d=c+j.get("el").outerHeight(),f=b.get("y"),e=f+b.get("el").outerHeight();c=c<=e&&d>=e||c<=f&&d>=f}c&&(i?i.get("y")<b.get("y")&&(i=b):i=b);return i})}var o=f.Event,m={}.a,p=f.DOM,t={zIndex:l.baseZIndex(l.zIndexManager.BUBBLE_VIEW),elCls:"ks-editor-bubble",
prefixCls:"ks-editor-",effect:{effect:"fade",duration:0.3}};l.prototype.addBubble=function(j,i,d){function b(){g.hide();var a=e.get("window")[0];o.remove(a,"scroll",n)}function c(){var a;var c=g,b=c.get("editorSelectedEl");if(b){var f=c.get("editor"),d=f.get("window")[0],e=f.get("iframe").offset(),c=e.top,e=e.left,i=e+p.width(d),d=c+p.height(d),h=b.offset(),h=l.Utils.getXY(h,f),f=h.top,h=h.left,j=h+b.width(),b=f+b.height(),k;b>d&&f<d?k=d-30:b>c&&b<d&&(k=b);j>e&&h<e?a=e:h>e&&h<i&&(a=h);a=a!==m&&k!==
m?[a,k]:m}else a=m;if(a){g.set("xy",a);if(k=r(g))a[1]=k.get("y")+k.get("el").outerHeight(),g.set("xy",a);g.get("visible")||g.show()}}function n(){g.get("editorSelectedEl")&&(g.get("el"),g.hide(),u())}function s(){var a=e.get("window")[0];o.on(a,"scroll",n);c()}var e=this,g,d=d||{};d.editor=e;f.mix(d,t);g=new q(d);e.addControl(j+"/bubble",g);e.on("selectionChange",function(a){var a=a.path,c=a.elements;if(a&&c&&(a=a.lastElement))(a=i(a))?(g.set("editorSelectedEl",a),g.hide(),f.later(s,10)):b()});e.on("sourceMode",
b);var u=f.buffer(c,350)}},{requires:["overlay","editor"]});
