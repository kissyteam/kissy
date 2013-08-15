/*
Copyright 2013, KISSY UI Library v1.31
MIT Licensed
build time: Aug 15 16:16
*/
KISSY.add("editor/plugin/undo/index",function(e,b,c,f){function d(){}e.augment(d,{pluginRenderUI:function(a){f.init(a);a.addButton("undo",{mode:b.WYSIWYG_MODE,tooltip:"\u64a4\u9500",editor:a},c.UndoBtn);a.addButton("redo",{mode:b.WYSIWYG_MODE,tooltip:"\u91cd\u505a",editor:a},c.RedoBtn)}});return d},{requires:["editor","./btn","./cmd"]});
