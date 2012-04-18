/**
 * Adds a heading tag around a selection or insertion point line.
 * Requires the tag-name string to be passed in as a value argument (i.e. "H1", "H6")
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/heading/cmd", function (S, KE) {
    return {
        init:function (editor) {
            if (!editor.hasCommand("heading")) {
                editor.addCommand("heading", {
                    exec:function (editor, tag) {
                        editor.execCommand("save");
                        new KE.Style({
                            element:tag
                        }).apply(editor.get("document")[0]);
                        editor.execCommand("save");
                    }
                });


                var queryCmd = KE.Utils.getQueryCmd("heading");
                editor.addCommand(queryCmd, {
                    exec:function (editor, elementPath, tag) {
                        return new KE.Style({
                            element:tag
                        }).checkActive(elementPath);
                    }
                });
            }


        }
    };
}, {
    requires:['editor']
});