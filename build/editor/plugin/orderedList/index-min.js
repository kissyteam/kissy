/*
Copyright 2012, KISSY UI Library v1.30rc
MIT Licensed
build time: Jul 11 21:28
*/
KISSY.add("editor/plugin/orderedList/index",function(b,c,d,e){function a(){}b.augment(a,{renderUI:function(a){e.init(a);a.addButton("orderedList",{cmdType:"insertOrderedList",mode:c.WYSIWYG_MODE},d)}});return a},{requires:["editor","../listUtils/btn","./cmd"]});
