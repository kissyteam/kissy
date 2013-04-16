/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:20
*/
KISSY.add("editor/plugin/undo",function(e,b,c,f){function d(){}e.augment(d,{pluginRenderUI:function(a){a.addButton("undo",{mode:b.Mode.WYSIWYG_MODE,tooltip:"\u64a4\u9500",editor:a},c.UndoBtn);a.addButton("redo",{mode:b.Mode.WYSIWYG_MODE,tooltip:"\u91cd\u505a",editor:a},c.RedoBtn);f.init(a)}});return d},{requires:["editor","./undo/btn","./undo/cmd"]});
