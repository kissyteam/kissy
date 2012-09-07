/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Sep 7 13:43
*/
KISSY.add("editor/plugin/bubble/index",function(e,p,l){function q(j){var i=null,b=j.get("editor").getControls();e.each(b,function(c){var a;if(a=c.get)if(a=-1!=(c.get("elCls")||"").indexOf("bubble"))if(a=c!==j)if(a=c.get("visible")){a=j.get("y");var b=a+j.get("el").outerHeight(),e=c.get("y"),d=e+c.get("el").outerHeight();a=a<=d&&b>=d||a<=e&&b>=e}a&&(i?i.get("y")<c.get("y")&&(i=c):i=c);return i})}var m={}.a,s={zIndex:l.baseZIndex(l.zIndexManager.BUBBLE_VIEW),elCls:"{prefixCls}editor-bubble",prefixCls:"{prefixCls}editor-",
effect:{effect:"fade",duration:0.3}};l.prototype.addBubble=function(j,i,b){function c(){f.hide();var g=d.get("window");g&&g.detach("scroll",n)}function a(){var g;var b=f,a=b.get("editorSelectedEl");if(a){var c=b.get("editor"),e=c.get("window"),d=c.get("iframe").offset(),b=d.top,d=d.left,i=d+e.width(),e=b+e.height(),h=a.offset(),h=l.Utils.getXY(h,c),c=h.top,h=h.left,j=h+a.width(),a=c+a.height(),k;a>e&&c<e?k=e-30:a>b&&a<e&&(k=a);j>d&&h<d?g=d:h>d&&h<i&&(g=h);g=g!==m&&k!==m?[g,k]:m}else g=m;if(g){f.set("xy",
g);if(k=q(f))g[1]=k.get("y")+k.get("el").outerHeight(),f.set("xy",g);f.get("visible")||f.show()}}function n(){f.get("editorSelectedEl")&&(f.get("el"),f.hide(),t())}function r(){d.get("window").on("scroll",n);a()}var d=this,o=d.get("prefixCls"),f,b=b||{};b.editor=d;e.mix(b,s);b.elCls=e.substitute(b.elCls,{prefixCls:o});b.prefixCls=e.substitute(b.prefixCls,{prefixCls:o});f=new p(b);d.addControl(j+"/bubble",f);d.on("selectionChange",function(a){var a=a.path,b=a.elements;if(a&&b&&(a=a.lastElement))(a=
i(a))?(f.set("editorSelectedEl",a),f.hide(),e.later(r,10)):c()});d.on("sourceMode",c);var t=e.buffer(a,350)}},{requires:["overlay","editor"]});
