/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 7 15:13
*/
KISSY.add("editor/plugin/listUtils/btn",function(f,d,e){function a(){var b=this.get("editor"),c=this.get("cmdType");b.execCommand(c);b.focus()}return e.Toggle.extend({offClick:a,onClick:a,selectionChange:function(b){var c=this.get("editor"),a=d.Utils.getQueryCmd(this.get("cmdType"));c.execCommand(a,b.path)?this.set("checked",!0):this.set("checked",!1)}},{ATTRS:{mode:{value:d.WYSIWYG_MODE}}})},{requires:["editor","../button/"]});
