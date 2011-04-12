/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: ${build.time}
*/
KISSY.add("overlay/overlayrender",function(d,b,e,c){function a(f){return d.require("uibase/"+f)}return e.create(c.Render,[a("contentboxrender"),a("positionrender"),a("loadingrender"),b.ie==6?a("shimrender"):null,a("maskrender")],{renderUI:function(){this.get("el").addClass(this.get("prefixCls")+"overlay")}},{ATTRS:{prefixCls:{value:"ks-"},elOrder:0}})},{requires:["ua","uibase","component"]});
KISSY.add("overlay/overlay",function(d,b,e,c){function a(f){return d.require("uibase/"+f)}b=b.create(e.ModelControl,[a("contentbox"),a("position"),a("loading"),a("align"),a("resize"),a("mask")]);b.DefaultRender=c;return b},{requires:["uibase","component","./overlayrender"]});KISSY.add("overlay/dialogrender",function(d,b,e){function c(a){return d.require("uibase/"+a)}return b.create(e,[c("stdmodrender"),c("closerender")])},{requires:["uibase","./overlayrender"]});
KISSY.add("overlay/dialog",function(d,b,e,c){function a(f){return d.require("uibase/"+f)}b=e.create(b,[a("stdmod"),a("close"),a("drag"),a("constrain")],{renderUI:function(){this.get("view").get("el").addClass(this.get("view").get("prefixCls")+"dialog");this.set("handlers",[this.get("view").get("header")])}});b.DefaultRender=c;return b},{requires:["overlay/overlay","uibase","overlay/dialogrender"]});
KISSY.add("overlay",function(d,b,e,c,a){b.Render=e;c.Render=a;b.Dialog=c;d.Overlay=b;d.Dialog=c;return b},{requires:["overlay/overlay","overlay/overlayrender","overlay/dialog","overlay/dialogrender"]});
