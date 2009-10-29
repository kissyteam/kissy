/*
Copyright (c) 2009, Kissy UI Library. All rights reserved.
MIT Licensed.
http://kissy.googlecode.com/

Date: 2009-10-29 13:15:57
Revision: 248
*/
var KISSY=window.KISSY||{};(function(){var h=YAHOO.util,f=h.Dom,d=h.Event,g=YAHOO.lang,b="data-lazyload-src",c={AUTO:"auto",MANUAL:"manual"},a={mod:c.AUTO,diff:f.getViewportHeight(),placeholder:"http://a.tbcdn.cn/kissy/1.0.0/build/imglazyload/spaceball.gif"};var e=function(j,i){if(!(this instanceof arguments.callee)){return new arguments.callee(j,i)}if(typeof i==="undefined"){i=j;j=[document]}if(!g.isArray(j)){j=[f.get(j)||document]}this.containers=j;this.config=g.merge(a,i||{});this._init()};g.augmentObject(e.prototype,{_init:function(){this.threshold=f.getViewportHeight()+this.config.diff;this.images=this._filterImgs();if(this.images.length>0){this._initLoadEvent()}},_initLoadEvent:function(){var k,i=this;d.on(window,"scroll",function j(){if(k){return}k=setTimeout(function(){i._loadImgs();if(i.images.length===0){d.removeListener(window,"scroll",j)}k=null},100)});if(this.config.mod===c.MANUAL){d.onDOMReady(function(){i._loadImgs(true)})}},_filterImgs:function(){var k=this.containers,q=this.threshold,u=this.config.placeholder,l=this.config.mod===c.MANUAL,j,t,p,o,r,m,v,s=[];for(j=0,t=k.length;j<t;++j){p=k[j].getElementsByTagName("img");for(o=0,r=p.length;o<r;++o){m=p[o];v=m.getAttribute(b);if(l){if(v){m.src=u;s.push(m)}}else{if(f.getY(m)>q&&!v){m.setAttribute(b,m.src);m.src=u;s.push(m)}}}}return s},_loadImgs:function(m){var n=f.getDocumentScrollTop();if(!m&&n<=this.config.diff){return}var q=this.images,j=this.threshold,l,k,p,o=[];for(l=0,k;k=q[l++];){if(f.getY(k)<j+n){p=k.getAttribute(b);if(p&&k.src!=p){k.src=p;k.removeAttribute(b)}}else{o.push(k)}}this.images=o}});KISSY.ImageLazyload=e})();
