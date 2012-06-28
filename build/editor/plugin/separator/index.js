/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 28 21:51
*/
/**
 * separator for button
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/separator/index", function (S) {

    function Separator() {
    }

    S.augment(Separator, {
        renderUI:function (editor) {
            S.all('<span ' +
                'class="ks-editor-toolbar-separator">&nbsp;' +
                '</span>')
                .appendTo(editor.get("toolBarEl"));
        }
    });

    return Separator;
}, {
    requires:['editor']
});
