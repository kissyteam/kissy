/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 18 17:43
*/
/**
 * source editor for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/sourceArea/index", function (S, Editor) {

    var SOURCE_MODE = Editor.SOURCE_MODE ,
        WYSIWYG_MODE = Editor.WYSIWYG_MODE;

    function sourceArea() {
    }

    S.augment(sourceArea, {
        renderUI:function (editor) {
            editor.addButton("sourceArea", {
                tooltip:"源码",
                listeners:{
                    afterSyncUI:function () {
                        var self = this;
                        editor.on("wysiwygMode", function () {
                            self.set("checked", false);
                        });
                        editor.on("sourceMode", function () {
                            self.set("checked", true);
                        });

                    },
                    click:function () {
                        var self = this;
                        var checked = self.get("checked");
                        if (checked) {
                            editor.set("mode", SOURCE_MODE);
                        } else {
                            editor.set("mode", WYSIWYG_MODE);
                        }

                        editor.focus();

                    }
                },
                checkable:true
            });
        }
    });

    return sourceArea;
}, {
    requires:['editor', '../button/']
});
