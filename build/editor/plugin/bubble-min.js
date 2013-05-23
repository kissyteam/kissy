/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: May 23 00:44
*/
KISSY.add("editor/plugin/bubble",function(f,t,n){function u(j){var h=null,a=j.get("editor").getControls();f.each(a,function(a){var b;if(b=a.isKeBubble)if(b=a!==j)if(b=a.get("visible")){b=j.get("y");var f=b+j.get("el").outerHeight(),i=a.get("y"),c=i+a.get("el").outerHeight();b=b<=c&&f>=c||b<=i&&f>=i}b&&(h?h.get("y")<a.get("y")&&(h=a):h=a)});return h}var i={}.a,w={zIndex:n.baseZIndex(n.zIndexManager.BUBBLE_VIEW),elCls:"{prefixCls}editor-bubble",prefixCls:"{prefixCls}editor-",effect:{effect:"fade",duration:0.3}};
n.prototype.addBubble=function(j,h,a){function p(){d.hide();var e=c.get("window");e&&(e.detach("scroll",q),r.stop())}function b(){var e;var a=d;if(e=a.get("editorSelectedEl")){var b=a.get("editor"),c=b.get("window"),k=b.get("iframe").offset(),a=k.top,k=k.left,h=k+c.width(),c=a+c.height(),g=e.offset(),g=n.Utils.getXY(g,b),b=g.top,g=g.left,j=g+e.width(),m=b+e.height(),l,o;f.UA.ie&&"img"==e[0].nodeName.toLowerCase()&&m>c?e=i:(m>c&&b<c?o=c-30:m>a&&m<c&&(o=m),j>k&&g<k?l=k:g>k&&g<h&&(l=g),e=l!==i&&o!==
i?[l,o]:i)}else e=i;if(e){d.set("xy",e);if(l=u(d))e[1]=l.get("y")+l.get("el").outerHeight(),d.set("xy",e);d.get("visible")||d.show()}}function q(){d.get("editorSelectedEl")&&(d.get("el"),d.hide(),r())}function v(){c.get("window").on("scroll",q);b()}var c=this,s=c.prefixCls,d,a=a||{};a.editor=c;f.mix(a,w);a.elCls=f.substitute(a.elCls,{prefixCls:s});a.prefixCls=f.substitute(a.prefixCls,{prefixCls:s});d=new t(a);d.isKeBubble=1;c.addControl(j+"/bubble",d);c.on("selectionChange",function(a){var a=a.path,
b=a.elements;if(a&&b&&(a=a.lastElement))(a=h(a))?(d.set("editorSelectedEl",a),d.hide(),f.later(v,10)):p()});c.on("sourceMode",p);var r=f.buffer(b,350)}},{requires:["overlay","editor"]});
