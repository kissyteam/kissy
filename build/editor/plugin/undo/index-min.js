/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 10 21:07
*/
KISSY.add("editor/plugin/undo/index",function(e,b,c,d){return{init:function(a){d.init(a);a.addButton("undo",{mode:b.WYSIWYG_MODE,tooltip:"撤销",editor:a},c.UndoBtn);a.addButton("redo",{mode:b.WYSIWYG_MODE,tooltip:"重做",editor:a},c.RedoBtn)}}},{requires:["editor","./btn","./cmd"]});
