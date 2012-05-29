/**
 * source editor for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/sourceArea/index", function (S, Editor, B) {

    var SOURCE_MODE = Editor.SOURCE_MODE ,
        WYSIWYG_MODE = Editor.WYSIWYG_MODE;
    return {
        init:function (editor) {
            editor.addButton({
                title:"源码",
                contentCls:"ke-toolbar-source"
            }, {
                init:function () {
                    var self = this;
                    editor.on("wysiwygMode", self.boff, self);
                    editor.on("sourceMode", self.bon, self);
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
