/*
Copyright (c) 2009, Kissy UI Library. All rights reserved.
MIT Licensed
http://kissy.googlecode.com/

Date: 2009-08-25 16:40:36
Revision: 121
*/
var KISSY=window.KISSY||{};(function(){var g=YAHOO.util,e=g.Dom,c=g.Event,f=YAHOO.lang,b="data-lazyload",a={diff:e.getViewportHeight(),placeholder:"spaceball.gif"};function d(i,h){if(!(this instanceof arguments.callee)){return new arguments.callee(i,h)}if(typeof h==="undefined"){h=i;i=document}this.container=e.get(i)||document;this.config=f.merge(a,h||{});this._init()}f.augmentObject(d.prototype,{_init:function(){this.threshold=e.getViewportHeight()+this.config.diff;this.images=this._filterImgs();if(this.images.length>0){this._initScroll()}},_initScroll:function(){var i,h=this;c.on(window,"scroll",function(){if(i){return}i=setTimeout(function(){h._loadImgs();if(h.images.length===0){c.removeListener(window,"scroll",arguments.callee)}i=null},100)})},_filterImgs:function(){var o=this.container.getElementsByTagName("img"),j=this.threshold,n=this.config.placeholder,k,l=[];for(var m=0,h=o.length;m<h;++m){k=o[m];if(e.getY(k)>j){k.setAttribute(b,k.src);k.src=n;l.push(k)}}return l},_loadImgs:function(){var l=e.getDocumentScrollTop();if(l<=this.config.diff){return}var o=this.images,h=this.threshold,m,n=[];for(var k=0,j;j=o[k++];){if(e.getY(j)<h+l){m=j.getAttribute(b);if(m){j.src=m;j.removeAttribute(b)}}else{n.push(j)}}this.images=n}});KISSY.ImageLazyload=d})();
