/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 5 21:37
*/
/**
 * Adds a heading tag around a selection or insertion point line.
 * Requires the tag-name string to be passed in as a value argument (i.e. "H1", "H6")
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/heading/cmd", function (S, Editor) {
    return {
        init:function (editor) {
            if (!editor.hasCommand("heading")) {
                editor.addCommand("heading", {
                    exec:function (editor, tag) {
                        editor.execCommand("save");
                        new Editor.Style({
                            element:tag
                        }).apply(editor.get("document")[0]);
                        editor.execCommand("save");
                    }
                });


                var queryCmd = Editor.Utils.getQueryCmd("heading");
                editor.addCommand(queryCmd, {
                    exec:function (editor, elementPath, tag) {
                        return new Editor.Style({
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
