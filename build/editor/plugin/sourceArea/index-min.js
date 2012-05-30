/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 30 21:24
*/
KISSY.add("editor/plugin/sourceArea/index",function(e,b){var c=b.SOURCE_MODE,d=b.WYSIWYG_MODE;return{init:function(a){a.addButton({title:"源码",contentCls:"ks-editor-toolbar-source"},{init:function(){a.on("wysiwygMode",this.boff,this);a.on("sourceMode",this.bon,this)},offClick:function(){a.set("mode",c)},onClick:function(){a.set("mode",d)}})}}},{requires:["editor","../button/"]});
