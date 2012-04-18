KISSY.add("editor/plugin/color/cmd", function (S, KE) {
    function applyColor(editor, c, styles) {
        var doc = editor.get("document")[0];
        editor.execCommand("save");
        if (c) {
            new KE.Style(styles, {
                color:c
            }).apply(doc);
        } else {
            // Value 'inherit'  is treated as a wildcard,
            // which will match any value.
            //清除已设格式
            new KE.Style(styles, {
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