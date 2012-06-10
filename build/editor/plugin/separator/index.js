/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 10 21:07
*/
/**
 * separator for button
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/separator/index", function (S) {
    return {
        init:function (editor) {
            new S.Node('<span ' +
                'class="ks-editor-toolbar-separator">&nbsp;' +
                '</span>')
                .appendTo(editor.get("toolBarEl"));
        }
    };
}, {
    requires:['editor']
});
