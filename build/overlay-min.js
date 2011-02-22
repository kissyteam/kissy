/*
Copyright 2011, KISSY UI Library v1.1.7dev
MIT Licensed
build time: ${build.time}
*/
KISSY.add("overlay/overlay",function(d,b,c){function a(e){return d.require("uibase/"+e)}return c.create([a("box"),a("contentbox"),a("position"),a("loading"),b.ie==6?a("shim"):null,a("align"),a("resize"),a("mask")],{initializer:function(){},renderUI:function(){this.get("el").addClass("ks-overlay")},syncUI:function(){},bindUI:function(){},destructor:function(){}},{ATTRS:{elOrder:0}})},{requires:["ua","uibase"]});
KISSY.add("overlay/dialog",function(d,b,c){function a(e){return d.require("uibase/"+e)}return c.create(b,[a("stdmod"),a("close"),a("drag"),a("constrain")],{initializer:function(){},renderUI:function(){this.get("el").addClass("ks-dialog");this.set("handlers",[this.get("header")])},bindUI:function(){},syncUI:function(){},destructor:function(){}})},{requires:["overlay/overlay","uibase"]});KISSY.add("overlay",function(d,b,c){b.Dialog=c;return b},{requires:["overlay/overlay","overlay/dialog"]});
