/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 3 13:53
*/
KISSY.add("editor/plugin/justify-left",function(c,d,f){function g(){var a=this.get("editor");a.execCommand("justifyLeft");a.focus()}function e(){}c.augment(e,{pluginRenderUI:function(a){f.init(a);a.addButton("justifyLeft",{tooltip:"\u5de6\u5bf9\u9f50",checkable:!0,listeners:{click:g,afterSyncUI:function(){var b=this;a.on("selectionChange",function(){a.get("mode")!=d.Mode.SOURCE_MODE&&(a.queryCommandValue("justifyLeft")?b.set("checked",!0):b.set("checked",!1))})}},mode:d.Mode.WYSIWYG_MODE});a.docReady(function(){a.get("document").on("keydown",
function(b){b.ctrlKey&&b.keyCode==c.Node.KeyCode.L&&(a.execCommand("justifyLeft"),b.preventDefault())})})}});return e},{requires:["editor","./justify-left/cmd"]});
