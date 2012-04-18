/**
 * Add indent button.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/outdent/index", function (S, KE, indexCmd) {

    return {
        init:function (editor) {

            indexCmd.init(editor);

            var queryOutdent = KE.Utils.getQueryCmd("outdent");

            editor.addButton({
                title:"减少缩进量 ",
                mode:KE.WYSIWYG_MODE,
                contentCls:"ke-toolbar-outdent"
            }, {
                offClick:function () {
                    editor.execCommand("outdent");
                },
                selectionChange:function (e) {
                    var self = this;
                    if (editor.execCommand(queryOutdent, e.path)) {
                        self.enable();
                    } else {
                        self.disable();
                    }
                }
            });
        }
    };

}, {
    requires:['editor', './cmd']
});