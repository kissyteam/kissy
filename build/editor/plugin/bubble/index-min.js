/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 13 14:40
*/
KISSY.add("editor/plugin/bubble/index",function(d,p,g){function q(i){var h=null,c=i.get("editor").getControls();d.each(c,function(b){var a;if(a=b.get)if(a=-1!=(b.get("elCls")||"").indexOf("bubble"))if(a=b!==i)if(a=b.get("visible")){a=i.get("y");var c=a+i.get("el").outerHeight(),d=b.get("y"),e=d+b.get("el").outerHeight();a=a<=e&&c>=e||a<=d&&c>=d}a&&(h?h.get("y")<b.get("y")&&(h=b):h=b);return h})}var m=d.Event,l={}.a,n=d.DOM,s={zIndex:g.baseZIndex(g.zIndexManager.BUBBLE_VIEW),elCls:"ks-editor-bubble",
prefixCls:"ks-editor-",effect:{effect:"fade",duration:0.3}};g.prototype.addBubble=function(i,h,c){function b(){e.hide();m.remove(o,"scroll",g)}function a(){var f;var a=e,b=a.get("editorSelectedEl");if(b){var a=a.get("editor"),d=a.get("window")[0],c=a.get("iframe").offset(),a=c.top,c=c.left,h=c+n.width(d),d=a+n.height(d),j=b.offset(l,window),g=j.top,j=j.left,i=j+b.width(),b=g+b.height(),k;b>d&&g<d?k=d-30:b>a&&b<d&&(k=b);i>c&&j<c?f=c:j>c&&j<h&&(f=j);f=f!==l&&k!==l?[f,k]:l}else f=l;if(f){e.set("xy",
f);if(k=q(e))f[1]=k.get("y")+k.get("el").outerHeight(),e.set("xy",f);e.get("visible")||e.show()}}function g(){e.get("editorSelectedEl")&&(e.get("el"),e.hide(),t())}function r(){m.on(o,"scroll",g);a()}var e,c=c||{};c.editor=this;d.mix(c,s);e=new p(c);this.addControl(i+"/bubble",e);this.on("selectionChange",function(a){var a=a.path,c=a.elements;if(a&&c&&(a=a.lastElement))(a=h(a))?(e.set("editorSelectedEl",a),e.hide(),d.later(r,10)):b()});this.on("sourceMode",b);var o=this.get("window")[0],t=d.buffer(a,
350)}},{requires:["overlay","editor"]});
