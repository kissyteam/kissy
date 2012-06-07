/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 7 15:13
*/
/**
 * source editor for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/sourceArea/index", function (S, Editor, B) {

    var SOURCE_MODE = Editor.SOURCE_MODE ,
        WYSIWYG_MODE = Editor.WYSIWYG_MODE;
    return {
        init:function (editor) {
            editor.addButton("sourceArea", {
                tooltip:"源码",
                checkable:true
            }, {
                init:function () {
                    var self = this;
                    editor.on("wysiwygMode", function () {
                        self.set("checked", false);
                    });
                    editor.on("sourceMode", function () {
                        self.set("checked", true);
                    });
                },
                offClick:function () {
                    editor.set("mode", SOURCE_MODE);
                },
                onClick:function () {
                    editor.set("mode", WYSIWYG_MODE);
                }
            });
        }
    };
}, {
    requires:['editor', '../button/']
});
