/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 30 22:57
*/
KISSY.add("editor/plugin/ordered-list/index",function(b,c,d,e){function a(){}b.augment(a,{renderUI:function(a){e.init(a);a.addButton("orderedList",{cmdType:"insertOrderedList",mode:c.WYSIWYG_MODE},d)}});return a},{requires:["editor","../list-utils/btn","./cmd"]});
