/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:48
*/
KISSY.add("editor/plugin/remove-format",["editor","./button","./remove-format/cmd"],function(f,a,g,c){function b(){}var d=a("editor");a("./button");var e=a("./remove-format/cmd");b.prototype={pluginRenderUI:function(a){e.init(a);a.addButton("removeFormat",{tooltip:"\u6e05\u9664\u683c\u5f0f",listeners:{click:function(){a.execCommand("removeFormat")}},mode:d.Mode.WYSIWYG_MODE})}};c.exports=b});
