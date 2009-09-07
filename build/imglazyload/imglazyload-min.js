/*
Copyright (c) 2009, Kissy UI Library. All rights reserved.
MIT Licensed.
http://kissy.googlecode.com/

Date: 2009-09-07 22:43:08
Revision: 138
*/
var KISSY=window.KISSY||{};(function(){var h=YAHOO.util,f=h.Dom,d=h.Event,g=YAHOO.lang,b="data-lazyload-src",c={AUTO:"auto",MANUAL:"manual"},a={mod:c.AUTO,diff:f.getViewportHeight(),placeholder:"spaceball.gif"};var e=function(j,i){if(!(this instanceof arguments.callee)){return new arguments.callee(j,i)}if(typeof i==="undefined"){i=j;j=[document]}if(!g.isArray(j)){j=[f.get(j)||document]}this.containers=j;this.config=g.merge(a,i||{});this._init()};g.augmentObject(e.prototype,{_init:function(){this.threshold=f.getViewportHeight()+this.config.diff;this.images=this._filterImgs();if(this.images.length>0){this._initLoadEvent()}},_initLoadEvent:function(){var j,i=this;d.on(window,"scroll",function(){if(j){return}j=setTimeout(function(){i._loadImgs();if(i.images.length===0){d.removeListener(window,"scroll",arguments.callee)}j=null},100)});if(this.config.mod===c.MANUAL&&f.getDocumentScrollTop()===0){d.onDOMReady(function(){i._loadImgs(true)})}},_filterImgs:function(){var k=this.containers,q=this.threshold,u=this.config.placeholder,l=this.config.mod===c.MANUAL,o,v,t=[];for(var j=0,s=k.length;j<s;++j){var p=k[j].getElementsByTagName("img");for(var m=0,r=p.length;m<r;++m){o=p[m];v=o.getAttribute(b);if(l&&v){o.src=u;t.push(o)}else{if(f.getY(o)>q){o.setAttribute(b,o.src);o.src=u;t.push(o)}}}}return t},_loadImgs:function(m){var n=f.getDocumentScrollTop();if(!m&&n<=this.config.diff){return}var q=this.images,j=this.threshold,p,o=[];for(var l=0,k;k=q[l++];){if(f.getY(k)<j+n){p=k.getAttribute(b);if(p&&k.src!=p){k.src=p;k.removeAttribute(b)}}else{o.push(k)}}this.images=o}});KISSY.ImageLazyload=e})();
