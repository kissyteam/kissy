/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Mar 6 13:26
*/
KISSY.add("editor/plugin/undo/index",function(e,b,c,f){function d(){}e.augment(d,{pluginRenderUI:function(a){a.addButton("undo",{mode:b.WYSIWYG_MODE,tooltip:"撤销",editor:a},c.UndoBtn);a.addButton("redo",{mode:b.WYSIWYG_MODE,tooltip:"重做",editor:a},c.RedoBtn);f.init(a)}});return d},{requires:["editor","./btn","./cmd"]});
