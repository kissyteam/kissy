/*
Copyright 2013, KISSY v1.41
MIT Licensed
build time: Dec 4 22:14
*/
KISSY.add("editor/plugin/undo",["editor","./undo/btn","./undo/cmd","./button"],function(f,b){function c(){}var d=b("editor"),e=b("./undo/btn"),g=b("./undo/cmd");b("./button");f.augment(c,{pluginRenderUI:function(a){a.addButton("undo",{mode:d.Mode.WYSIWYG_MODE,tooltip:"\u64a4\u9500",editor:a},e.UndoBtn);a.addButton("redo",{mode:d.Mode.WYSIWYG_MODE,tooltip:"\u91cd\u505a",editor:a},e.RedoBtn);g.init(a)}});return c});
