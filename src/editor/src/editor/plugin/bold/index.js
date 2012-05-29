KISSY.add("editor/plugin/bold/index", function (S, Editor, ui,cmd) {
    return {
        init:function (editor) {
            cmd.init(editor);
            editor.addButton({
                cmdType:'bold',
                contentCls:"ke-toolbar-bold",
                title:"粗体 "
            }, undefined, ui.Button);
        }
    };
}, {
    requires:['editor', '../font/ui','./cmd']
});