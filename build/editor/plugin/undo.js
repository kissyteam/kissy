/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 14 22:23
*/
KISSY.add("editor/plugin/undo",["editor","./undo/btn","./undo/cmd","./button"],function(g,b){function c(){}var d=b("editor"),e=b("./undo/btn"),f=b("./undo/cmd");b("./button");c.prototype={pluginRenderUI:function(a){a.addButton("undo",{mode:d.Mode.WYSIWYG_MODE,tooltip:"\u64a4\u9500",editor:a},e.UndoBtn);a.addButton("redo",{mode:d.Mode.WYSIWYG_MODE,tooltip:"\u91cd\u505a",editor:a},e.RedoBtn);f.init(a)}};return c});
