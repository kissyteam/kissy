KISSY.add("editor/plugin/backColor/index", function (S, KE, Button, cmd) {

    return {
        init:function (editor) {
            cmd.init(editor);
            editor.addButton({
                cmdType:'backColor',
                title:"背景颜色",
                contentCls:"ke-toolbar-back-color"
            }, undefined, Button);
        }
    };
}, {
    requires:['editor', '../color/btn', './cmd']
});