/*
Copyright 2011, KISSY UI Library v1.1.7dev
MIT Licensed
build time: ${build.time}
*/
KISSY.add("overlay/dialog",function(c,b,d,e){function a(f){return c.require("uibase/"+f)}return d.create(b,[a("stdmod"),a("close"),a("drag"),a("constrain")],{renderUI:function(){this.get("view").get("el").addClass("ks-dialog");this.set("handlers",[this.get("view").get("header")])}},{ATTRS:{view:{valueFn:function(){return new e}}}})},{requires:["overlay/overlay","uibase","overlay/dialogrender"]});
KISSY.add("overlay/dialogrender",function(c,b,d){return b.create(d,[c.require("uibase/stdmodrender"),c.require("uibase/closerender")])},{requires:["uibase","./overlayrender"]});KISSY.add("overlay/overlay",function(c,b,d,e){function a(f){return c.require("uibase/"+f)}return b.create(d.ModelControl,[a("box"),a("contentbox"),a("position"),a("loading"),a("align"),a("resize"),a("mask")],{},{ATTRS:{view:{valueFn:function(){return new e}}}})},{requires:["uibase","component","./overlayrender"]});
KISSY.add("overlay/overlayrender",function(c,b,d,e){function a(f){return c.require("uibase/"+f)}return d.create(e.Render,[a("boxrender"),a("contentboxrender"),a("positionrender"),a("loadingrender"),b.ie==6?a("shimrender"):null,a("maskrender")],{renderUI:function(){this.get("el").addClass("ks-overlay")}},{ATTRS:{elOrder:0}})},{requires:["ua","uibase","component"]});
KISSY.add("overlay",function(c,b,d,e,a){b.Render=d;e.Render=a;b.Dialog=e;return b},{requires:["overlay/overlay","overlay/overlayrender","overlay/dialog","overlay/dialogrender"]});
