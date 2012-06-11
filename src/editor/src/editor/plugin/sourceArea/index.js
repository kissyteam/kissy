/**
 * source editor for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/sourceArea/index", function (S, Editor) {

    var SOURCE_MODE = Editor.SOURCE_MODE ,
        WYSIWYG_MODE = Editor.WYSIWYG_MODE;
    return {
        init:function (editor) {
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
    };
}, {
    requires:['editor', '../button/']
});
