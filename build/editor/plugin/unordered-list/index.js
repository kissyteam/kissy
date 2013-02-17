/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Feb 17 17:29
*/
/**
 * Add ul/ol button.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/unordered-list/index", function (S, Editor, ListButton, ListCmd) {

    function unorderedList() {
    }

    S.augment(unorderedList, {
        pluginRenderUI: function (editor) {
            ListCmd.init(editor);

            ListButton.init(editor, {
                cmdType: "insertUnorderedList",
                buttonId: 'unorderedList',
                menu: {
                    width:75,
                    children: [
                        {
                            content: '● 圆点',
                            value: 'disc'
                        },
                        {
                            content: '○ 圆圈',
                            value: 'circle'
                        },
                        {
                            content: '■ 方块',
                            value: 'square'
                        }
                    ]
                },
                tooltip: '无序列表'
            });
        }
    });

    return unorderedList;
}, {
    requires: ['editor', '../list-utils/btn', './cmd']
});
