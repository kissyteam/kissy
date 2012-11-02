/*
 Constructor for kissy editor,dependency moved to independent module
 thanks to CKSource's intelligent work on CKEditor
 @author yiminghe@gmail.com, lifesinger@gmail.com
 @version: 2
 @buildtime: 2012-10-29 15:53:12
*/
KISSY.add("editor/export",function(a){function d(e,c){var b=this;if(!(b instanceof d))return new d(e,c);a.isString(e)&&(e=a.one(e));e=l._4e_wrap(e);c=c||{};c.pluginConfig=c.pluginConfig||{};b.cfg=c;c.pluginConfig=c.pluginConfig;b.cfg=c;a.app(b,a.EventTarget);var j=["htmldataprocessor","enterkey","clipboard"],h=m;b.use=function(f,g){f=f.split(",");if(!h)for(var i=0;i<j.length;i++){var k=j[i];a.inArray(k,f)||f.unshift(k)}b.ready(function(){a.Editor.use("button,select",function(){a.use.call(b,f.join(","),
function(){for(var a=0;a<f.length;a++)b.usePlugin(f[a]);g&&g.call(b);h||(b.setData(e.val()),c.focus?b.focus():(a=b.getSelection())&&a.removeAllRanges(),h=n)},{global:d})})});return b};b.use=b.use;b.Config.base=d.Config.base;b.Config.debug=d.Config.debug;b.Config.componentJsName=g;b.init(e)}var l=a.DOM,n=!0,m=!1,g;g=1.2>parseFloat(a.version)?function(){return"plugin-min.js?t="+encodeURIComponent("2012-10-29 15:53:12")}:function(a,c){return a+"/plugin-min.js"+(c?c:"?t="+encodeURIComponent("2012-10-29 15:53:12"))};
a.app(d,a.EventTarget);d.Config.base=a.Config.base+"editor/plugins/";d.Config.debug=a.Config.debug;d.Config.componentJsName=g;a.Editor=d;a.Editor=d});KISSY.add("editor",function(a){return a.Editor},{requires:["dd","overlay"]});
