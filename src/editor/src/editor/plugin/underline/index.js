KISSY.add("editor/plugin/underline/index", function (S, KE, ui, cmd) {
    return {
        init:function (editor) {
            cmd.init(editor);
            editor.addButton({
                cmdType:"underline",
                contentCls:"ke-toolbar-underline",
                title:"下划线 "
            }, undefined, ui.Button);
        }
    };
}, {
    requires:['editor', '../font/ui', './cmd']
});