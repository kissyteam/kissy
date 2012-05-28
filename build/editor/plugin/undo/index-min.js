/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 28 19:44
*/
KISSY.add("editor/plugin/undo/index",function(e,b,c,d){return{init:function(a){d.init(a);a.addButton({mode:b.WYSIWYG_MODE,title:"撤销",editor:a,contentCls:"ke-toolbar-undo"},void 0,c.UndoBtn);a.addButton({mode:b.WYSIWYG_MODE,title:"重做",editor:a,contentCls:"ke-toolbar-redo"},void 0,c.RedoBtn)}}},{requires:["editor","./btn","./cmd"]});
