/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 7 00:48
*/
KISSY.add("editor/plugin/sourceArea/index",function(e,a){var c=a.SOURCE_MODE,d=a.WYSIWYG_MODE;return{init:function(b){b.addButton("sourceArea",{tooltip:"源码",checkable:!0},{init:function(){var a=this;b.on("wysiwygMode",function(){a.set("checked",!1)});b.on("sourceMode",function(){a.set("checked",!0)})},offClick:function(){b.set("mode",c)},onClick:function(){b.set("mode",d)}})}}},{requires:["editor","../button/"]});
