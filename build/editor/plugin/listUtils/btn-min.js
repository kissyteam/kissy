/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 29 18:24
*/
KISSY.add("editor/plugin/listUtils/btn",function(d,e,f){function a(){a.superclass.constructor.apply(this,arguments)}function b(){var a=this.get("editor"),c=this.get("cmdType");a.execCommand(c)}d.extend(a,f,{offClick:b,onClick:b,selectionChange:function(a){var c=this.get("editor"),b=e.Utils.getQueryCmd(this.get("cmdType"));c.execCommand(b,a.path)?this.bon():this.boff()}});return a},{requires:["editor","../button/"]});
