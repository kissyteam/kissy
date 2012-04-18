KISSY.add("editor/plugin/foreColor/index", function (S, KE, Button, cmd) {

    return {
        init:function (editor) {
            cmd.init(editor);
            editor.addButton({
                cmdType:'foreColor',
                title:"文本颜色",
                contentCls:"ke-toolbar-fore-color"
            }, undefined, Button);
        }
    };
}, {
    requires:['editor', '../color/btn', './cmd']
});