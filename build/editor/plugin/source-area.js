/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:20
*/
/**
 * source editor for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/source-area", function (S, Editor) {

    var SOURCE_MODE = Editor.Mode.SOURCE_MODE ,
        WYSIWYG_MODE = Editor.Mode.WYSIWYG_MODE;

    function sourceArea() {
    }

    S.augment(sourceArea, {
        pluginRenderUI:function (editor) {
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
                    }
                },
                checkable:true
            });
        }
    });

    return sourceArea;
}, {
    requires:['editor', './button']
});
