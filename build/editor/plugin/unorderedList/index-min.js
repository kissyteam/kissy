/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 5 10:58
*/
KISSY.add("editor/plugin/unorderedList/index",function(b,c,d,e){function a(){}b.augment(a,{renderUI:function(a){e.init(a);a.addButton("unorderedList",{cmdType:"insertUnorderedList",mode:c.WYSIWYG_MODE},d)}});return a},{requires:["editor","../listUtils/btn","./cmd"]});
