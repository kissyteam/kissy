/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: May 15 16:34
*/
KISSY.add("editor/plugin/editor-multiple-uploader",function(c,d,e){function a(b){this.config=b||{}}c.augment(a,{pluginRenderUI:function(b){var a=this;b.addButton("multipleUpload",{tooltip:"\u6279\u91cf\u63d2\u56fe",listeners:{click:function(){e.useDialog(b,"editor-multiple-uploader",a.config)}},mode:d.Mode.WYSIWYG_MODE})}});return a},{requires:["editor","./dialog-loader"]});
