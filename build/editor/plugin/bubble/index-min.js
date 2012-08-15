/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Aug 15 19:31
*/
KISSY.add("editor/plugin/bubble/index",function(m,q,n){function r(i){var h=null,d=i.get("editor").getControls();m.each(d,function(b){var c;if(c=b.get)if(c=-1!=(b.get("elCls")||"").indexOf("bubble"))if(c=b!==i)if(c=b.get("visible")){c=i.get("y");var d=c+i.get("el").outerHeight(),l=b.get("y"),e=l+b.get("el").outerHeight();c=c<=e&&d>=e||c<=l&&d>=l}c&&(h?h.get("y")<b.get("y")&&(h=b):h=b);return h})}var o={}.a,s={zIndex:n.baseZIndex(n.zIndexManager.BUBBLE_VIEW),elCls:"ks-editor-bubble",prefixCls:"ks-editor-",
effect:{effect:"fade",duration:0.3}};n.prototype.addBubble=function(i,h,d){function b(){f.hide();var a=e.get("window");a&&a.detach("scroll",p)}function c(){var a;var c=f,b=c.get("editorSelectedEl");if(b){var d=c.get("editor"),e=d.get("window"),j=d.get("iframe").offset(),c=j.top,j=j.left,h=j+e.width(),e=c+e.height(),g=b.offset(),g=n.Utils.getXY(g,d),d=g.top,g=g.left,i=g+b.width(),b=d+b.height(),k;b>e&&d<e?k=e-30:b>c&&b<e&&(k=b);i>j&&g<j?a=j:g>j&&g<h&&(a=g);a=a!==o&&k!==o?[a,k]:o}else a=o;if(a){f.set("xy",
a);if(k=r(f))a[1]=k.get("y")+k.get("el").outerHeight(),f.set("xy",a);f.get("visible")||f.show()}}function p(){f.get("editorSelectedEl")&&(f.get("el"),f.hide(),t())}function l(){e.get("window").on("scroll",p);c()}var e=this,f,d=d||{};d.editor=e;m.mix(d,s);f=new q(d);e.addControl(i+"/bubble",f);e.on("selectionChange",function(a){var a=a.path,c=a.elements;if(a&&c&&(a=a.lastElement))(a=h(a))?(f.set("editorSelectedEl",a),f.hide(),m.later(l,10)):b()});e.on("sourceMode",b);var t=m.buffer(c,350)}},{requires:["overlay",
"editor"]});
