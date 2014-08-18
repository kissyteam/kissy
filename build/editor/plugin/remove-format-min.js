/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:25
*/
KISSY.add("editor/plugin/remove-format",["editor","./button","./remove-format/cmd"],function(c,a){function b(){}var d=a("editor");a("./button");var e=a("./remove-format/cmd");c.augment(b,{pluginRenderUI:function(a){e.init(a);a.addButton("removeFormat",{tooltip:"\u6e05\u9664\u683c\u5f0f",listeners:{click:function(){a.execCommand("removeFormat")}},mode:d.Mode.WYSIWYG_MODE})}});return b});
