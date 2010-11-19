/*
Copyright 2010, KISSY UI Library v1.1.5
MIT Licensed
build time: Nov 19 13:47
*/
KISSY.add("overlay",function(a){var b=a.Base.create([a.Ext.Box,a.Ext.ContentBox,a.Ext.Position,a.Ext.Loading,a.UA.ie==6?a.Ext.Shim:null,a.Ext.Align,a.Ext.Mask],{init:function(){this.on("bindUI",this._bindUIOverlay,this);this.on("renderUI",this._renderUIOverlay,this);this.on("syncUI",this._syncUIOverlay,this)},_renderUIOverlay:function(){this.get("el").addClass("ks-overlay")},_syncUIOverlay:function(){},_bindUIOverlay:function(){},destructor:function(){}});a.Overlay=b},{requires:["core"]});
