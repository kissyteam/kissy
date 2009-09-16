/*
Copyright (c) 2009, Kissy UI Library. All rights reserved.
MIT Licensed.
http://kissy.googlecode.com/

Date: 2009-09-16 22:52:18
Revision: 148
*/
var KISSY=window.KISSY||{};(function(){var a=YAHOO.util,d=a.Dom,i=a.Event,e=YAHOO.lang,b='<div class="kissy-combobox-caption" style="width:{width}"><input type="text" autocomplete="off" /><span class="kissy-combobox-trigger"></span></div>',h='<div class="kissy-combobx-droplist" style="width:{width};max-height:{max-height}"><ol><li>{option}</li></ol></div>',g=document.createElement("div"),c={width:"150px",dropListWidth:"150px",dropListHeight:"300px"};var f=function(k,j){if(!(this instanceof arguments.callee)){return new arguments.callee(k,j)}this.orgEl=d.get(k);this.config=e.merge(c,j||{});this._init()};e.augmentObject(f.prototype,{_init:function(){this._renderUI()},_renderUI:function(){this._renderCaption();this._renderDropList()},_renderCaption:function(){var k=this.config,l=this.orgEl,j;g.innerHTML=b.replace("{width}",k.width);j=g.firstChild;l.parentNode.insertBefore(j,l);this.caption=j},_renderDropList:function(){var j=this.config,k;g.innerHTML=h.replace("{width}",j.dropListWidth).replace("{max-height}",j.dropListHeight);k=g.firstChild;document.body.appendChild(k);this.dropList=k}});KISSY.ComboBox=f})();
