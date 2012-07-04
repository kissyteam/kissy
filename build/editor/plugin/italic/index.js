/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 3 19:11
*/
/**
 * italic button.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/italic/index", function (S, Editor, ui, cmd) {

    function italic() {

    }

    S.augment(italic, {
        renderUI:function (editor) {
            cmd.init(editor);
            editor.addButton("italic", {
                cmdType:'italic',
                tooltip:"斜体 "
            }, ui.Button);
        }
    });

    return italic;
}, {
    requires:['editor', '../font/ui', './cmd']
});
