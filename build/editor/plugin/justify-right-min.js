/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 3 13:53
*/
KISSY.add("editor/plugin/justify-right",function(c,d,f){function g(){var a=this.get("editor");a.execCommand("justifyRight");a.focus()}function e(){}c.augment(e,{pluginRenderUI:function(a){f.init(a);a.addButton("justifyRight",{tooltip:"\u53f3\u5bf9\u9f50",checkable:!0,listeners:{click:g,afterSyncUI:function(){var b=this;a.on("selectionChange",function(){a.get("mode")!=d.Mode.SOURCE_MODE&&(a.queryCommandValue("justifyRight")?b.set("checked",!0):b.set("checked",!1))})}},mode:d.Mode.WYSIWYG_MODE});a.docReady(function(){a.get("document").on("keydown",
function(b){b.ctrlKey&&b.keyCode==c.Node.KeyCode.R&&(a.execCommand("justifyRight"),b.preventDefault())})})}});return e},{requires:["editor","./justify-right/cmd"]});
