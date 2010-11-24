/*
Copyright 2010, KISSY UI Library v1.1.6
MIT Licensed
build time: Nov 24 11:33
*/
KISSY.add("overlay",function(a){var b=a.Base.create([a.Ext.Box,a.Ext.ContentBox,a.Ext.Position,a.Ext.Loading,a.UA.ie==6?a.Ext.Shim:null,a.Ext.Align,a.Ext.Mask],{init:function(){this.on("bindUI",this._bindUIOverlay,this);this.on("renderUI",this._renderUIOverlay,this);this.on("syncUI",this._syncUIOverlay,this)},_renderUIOverlay:function(){this.get("el").addClass("ks-overlay")},_syncUIOverlay:function(){},_bindUIOverlay:function(){},destructor:function(){}});a.Overlay=b},{requires:["core"]});
KISSY.add("dialog",function(a){a.Dialog=a.Base.create(a.Overlay,[a.Ext.StdMod,a.Ext.Close,a.Ext.Drag,a.Ext.Constrain],{init:function(){this.on("renderUI",this._rendUIDialog,this);this.on("bindUI",this._bindUIDialog,this);this.on("syncUI",this._syncUIDialog,this)},_rendUIDialog:function(){this.get("el").addClass("ks-dialog");this.set("handlers",[this.get("header")])},_bindUIDialog:function(){},_syncUIDialog:function(){},destructor:function(){}})},{host:"overlay"});
