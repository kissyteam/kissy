/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:24
*/
KISSY.add("editor/plugin/outdent",["editor","./button","./outdent/cmd"],function(e,b){function c(){}var d=b("editor");b("./button");var f=b("./outdent/cmd");e.augment(c,{pluginRenderUI:function(a){f.init(a);a.addButton("outdent",{tooltip:"\u51cf\u5c11\u7f29\u8fdb\u91cf",listeners:{click:function(){a.execCommand("outdent");a.focus()},afterSyncUI:function(){var b=this;a.on("selectionChange",function(){a.get("mode")!==d.Mode.SOURCE_MODE&&(a.queryCommandValue("outdent")?b.set("disabled",!1):b.set("disabled",!0))})}},mode:d.Mode.WYSIWYG_MODE})}});
return c});
