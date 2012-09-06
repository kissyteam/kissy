/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Sep 7 02:29
*/
KISSY.add("editor/plugin/justify-left/index",function(c,d,f){function g(){var a=this.get("editor");a.execCommand("justifyLeft");a.focus()}function e(){}c.augment(e,{renderUI:function(a){f.init(a);a.addButton("justifyLeft",{tooltip:"左对齐",checkable:!0,listeners:{click:g,afterSyncUI:function(){var b=this;a.on("selectionChange",function(){a.get("mode")!=d.SOURCE_MODE&&(a.queryCommandValue("justifyLeft")?b.set("checked",!0):b.set("checked",!1))})}},mode:d.WYSIWYG_MODE});a.docReady(function(){a.get("document").on("keydown",
function(b){b.ctrlKey&&b.keyCode==c.Node.KeyCodes.L&&(a.execCommand("justifyLeft"),b.preventDefault())})})}});return e},{requires:["editor","./cmd"]});
