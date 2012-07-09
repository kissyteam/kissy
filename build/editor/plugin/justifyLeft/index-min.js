/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 4 20:40
*/
KISSY.add("editor/plugin/justifyLeft/index",function(d,c,e){function f(){var a=this.get("editor");a.execCommand("justifyLeft");a.focus()}function b(){}d.augment(b,{renderUI:function(a){e.init(a);a.addButton("justifyLeft",{tooltip:"左对齐",checkable:!0,listeners:{click:f,afterSyncUI:function(){var b=this;a.on("selectionChange",function(){a.get("mode")!=c.SOURCE_MODE&&(a.queryCommandValue("justifyLeft")?b.set("checked",!0):b.set("checked",!1))})}},mode:c.WYSIWYG_MODE})}});return b},{requires:["editor",
"./cmd"]});
