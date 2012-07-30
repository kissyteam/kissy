/*
Copyright 2012, KISSY UI Library v1.30rc
MIT Licensed
build time: Jul 30 23:49
*/
KISSY.add("editor/plugin/unordered-list/index",function(b,c,d,e){function a(){}b.augment(a,{renderUI:function(a){e.init(a);a.addButton("unorderedList",{cmdType:"insertUnorderedList",mode:c.WYSIWYG_MODE},d)}});return a},{requires:["editor","../list-utils/btn","./cmd"]});
