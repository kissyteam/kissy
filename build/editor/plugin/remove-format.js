/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 14 22:22
*/
KISSY.add("editor/plugin/remove-format",["editor","./button","./remove-format/cmd"],function(e,a){function b(){}var c=a("editor");a("./button");var d=a("./remove-format/cmd");b.prototype={pluginRenderUI:function(a){d.init(a);a.addButton("removeFormat",{tooltip:"\u6e05\u9664\u683c\u5f0f",listeners:{click:function(){a.execCommand("removeFormat")}},mode:c.Mode.WYSIWYG_MODE})}};return b});
