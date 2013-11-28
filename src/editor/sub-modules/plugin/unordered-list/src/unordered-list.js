/**
 * @ignore
 * Add ul/ol button.
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var ListButton = require('./list-utils/btn');
    var ListCmd = require('./unordered-list/cmd');

    function unorderedList() {
    }

    S.augment(unorderedList, {
        pluginRenderUI: function (editor) {
            ListCmd.init(editor);

            ListButton.init(editor, {
                cmdType: 'insertUnorderedList',
                buttonId: 'unorderedList',
                menu: {
                    width: 75,
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
});