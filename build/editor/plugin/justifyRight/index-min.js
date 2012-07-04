/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 4 20:40
*/
KISSY.add("editor/plugin/justifyRight/index",function(d,c,e){function f(){var a=this.get("editor");a.execCommand("justifyRight");a.focus()}function b(){}d.augment(b,{renderUI:function(a){e.init(a);a.addButton("justifyRight",{tooltip:"右对齐",checkable:!0,listeners:{click:f,afterSyncUI:function(){var b=this;a.on("selectionChange",function(){a.get("mode")!=c.SOURCE_MODE&&(a.queryCommandValue("justifyRight")?b.set("checked",!0):b.set("checked",!1))})}},mode:c.WYSIWYG_MODE})}});return b},{requires:["editor",
"./cmd"]});
