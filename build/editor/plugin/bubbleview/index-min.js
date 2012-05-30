/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 30 21:24
*/
KISSY.add("editor/plugin/bubbleview/index",function(f,l,m){function s(g){var e=null,j=i[f.stamp(g.editor)];f.each(j,function(c){var d;if(d=c!==g)if(d=c.get("visible")){d=g.get("y");var f=d+g.get("el").outerHeight(),a=c.get("y"),b=a+c.get("el").outerHeight();d=d<=b&&f>=b||d<=a&&f>=a}d&&(e?e.get("y")<c.get("y")&&(e=c):e=c);return e})}var p=f.Event,j={}.a,q=f.DOM,n=l.extend({},{ATTRS:{zIndex:{value:m.baseZIndex(m.zIndexManager.BUBBLE_VIEW)},elCls:{value:"ks-editor-bubbleview-bubble"},prefixCls:{value:"ks-editor-"},
effect:{value:{effect:"fade",duration:0.3}}}}),i={};n.register=function(g){function e(){b&&(b.hide(),p.remove(r,"scroll",c))}function m(){var h;var a=b.selectedEl,f=b.editor;if(a){var c=f.get("window")[0],d=f.get("iframe").offset(),f=d.top,d=d.left,g=d+q.width(c),c=f+q.height(c),e=a.offset(j,window),i=e.top,e=e.left,l=e+a.width(),a=i+a.height(),k;a>c&&i<c?k=c-30:a>f&&a<c&&(k=a);l>d&&e<d?h=d:e>d&&e<g&&(h=e);h=h!==j&&k!==j?[h,k]:j}else h=j;if(h){b.set("xy",h);if(k=s(b))h[1]=k.get("y")+k.get("el").outerHeight(),
b.set("xy",h);b.get("visible")||b.show()}}function c(){b.selectedEl&&(b&&(b.get("el"),b.hide()),t())}function d(){p.on(r,"scroll",c);m()}var l=g.filter,a=g.editor,b=new n({editor:a}),o=f.stamp(a),u=i[o]=i[o]||[];b.init=g.init;if(b.init)b.on("afterRenderUI",function(){b.init()});u.push(b);b.editor=a;a.on("destroy",function(){delete i[o];b.destroy()});a.on("selectionChange",function(a){var a=a.path,c=a.elements;if(a&&c&&(a=a.lastElement))(a=l(a))?(b.selectedEl=a,b.hide(),f.later(d,10)):b&&e()});a.on("sourceMode",
e);var r=a.get("window")[0],t=f.buffer(m,350)};return n},{requires:["overlay","editor"]});
