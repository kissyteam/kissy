/**
 * underline command
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/underline/cmd", function (S, Editor, Cmd) {

    var UNDERLINE_STYLE = new Editor.Style({
        element:'u',
        overrides:[
            {
                element:'span',
                attributes:{
                    style:'text-decoration: underline;'
                }
            }
        ]
    });
    return {
        init:function (editor) {
            Cmd.addButtonCmd(editor, "underline", UNDERLINE_STYLE);
        }};
}, {
    requires:['editor', '../font/cmd']
});