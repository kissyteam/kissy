/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:49
*/
KISSY.add("editor/plugin/undo",["editor","./undo/btn","./undo/cmd","./button"],function(h,b,i,f){function c(){}var d=b("editor"),e=b("./undo/btn"),g=b("./undo/cmd");b("./button");c.prototype={pluginRenderUI:function(a){a.addButton("undo",{mode:d.Mode.WYSIWYG_MODE,tooltip:"\u64a4\u9500",editor:a},e.UndoBtn);a.addButton("redo",{mode:d.Mode.WYSIWYG_MODE,tooltip:"\u91cd\u505a",editor:a},e.RedoBtn);g.init(a)}};f.exports=c});
