/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Feb 17 17:29
*/
/**
 * color command.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/color/cmd", function (S, Editor) {
    function applyColor(editor, c, styles) {
        var doc = editor.get("document")[0];
        editor.execCommand("save");
        if (c) {
            new Editor.Style(styles, {
                color:c
            }).apply(doc);
        } else {
            // Value 'inherit'  is treated as a wildcard,
            // which will match any value.
            //清除已设格式
            new Editor.Style(styles, {
                color:"inherit"
            }).remove(doc);
        }
        editor.execCommand("save");
    }

    return {
        applyColor:applyColor
    };
}, {
    requires:['editor']
});
