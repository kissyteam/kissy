/*
Copyright 2010, KISSY UI Library v1.1.7dev
MIT Licensed
build time: ${build.time}
*/
KISSY.add("overlay",function(a){a.Overlay=a.UIBase.create([a.UIBase.Box,a.UIBase.ContentBox,a.UIBase.Position,a.UIBase.Loading,a.UA.ie==6?a.UIBase.Shim:null,a.UIBase.Align,a.UIBase.Mask],{initializer:function(){},renderUI:function(){this.get("el").addClass("ks-overlay")},syncUI:function(){},bindUI:function(){},destructor:function(){}},{ATTRS:{elOrder:0}})},{requires:["uibase"]});
KISSY.add("dialog",function(a){a.Dialog=a.UIBase.create(a.Overlay,[a.UIBase.StdMod,a.UIBase.Close,a.UIBase.Drag,a.UIBase.Constrain],{initializer:function(){},renderUI:function(){this.get("el").addClass("ks-dialog");this.set("handlers",[this.get("header")])},bindUI:function(){},syncUI:function(){},destructor:function(){}})},{host:"overlay"});
