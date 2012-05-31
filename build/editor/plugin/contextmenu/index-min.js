/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 30 12:21
*/
KISSY.add("editor/plugin/contextmenu/index",function(e,i,l){function f(){f.superclass.constructor.apply(this,arguments)}var j=e.all,h=e.Event;f.register=function(a){function b(){d.hide()}var d=new f(a),c=a.editor;d.editor=c;c.on("destroy",function(){d.destroy()});c.on("sourceMode",b);c.docReady(function(){var g=c.get("document")[0];h.on(g,"mousedown",b);h.delegate(g,"contextmenu",a.filter,function(a){f.hide(c);var b=j(a.target);a.halt();var e=a.pageX,h=a.pageY;e||(a=b._4e_getOffset(void 0),e=a.left,
h=a.top);setTimeout(function(){d.selectedEl=b;d.show(i.Utils.getXY(e,h,g,document));f.show(d)},30)})});return d};var k={};f.hide=function(a){(a=k[e.stamp(a)])&&a.hide()};f.show=function(a){k[e.stamp(a.editor)]=a};e.extend(f,e.Base,{_init:function(){var a=this,b=a.get("handlers");a.menu=new l({autoRender:!0,width:a.get("width"),elCls:"ke-menu"});var d=a.menu.get("contentEl"),c;for(c in b){var g=j("<a href='#'>"+c+"</a>");d.append(g);b.hasOwnProperty(c)&&function(b,c){b.unselectable(void 0);b.on("click",
function(d){d.halt();b.hasClass("ke-menuitem-disable",void 0)||(a.hide(),e.later(c,30,!1,a))})}(g,b[c])}},destroy:function(){var a;(a=this.menu)&&a.destroy()},hide:function(){var a;(a=this.menu)&&a.hide()},_realShow:function(a){var b=this.menu;i.fire("contextmenu",{contextmenu:this});b.set("xy",[a.left,a.top]);var d=this.get("statusChecker"),c=this.editor;d&&b.get("contentEl").children("a").each(function(a){var b=d[e.trim(a.text())];b&&(b(c)?a.removeClass("ke-menuitem-disable",void 0):a.addClass("ke-menuitem-disable",
void 0))});b.show()},show:function(a){this._init();this.show=this._realShow;this.show(a)}});return f},{requires:["editor","overlay"]});
