/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 15 17:51
*/
/*
combined files : 

editor/plugin/unordered-list

*/
/**
 * @ignore
 * Add ul/ol button.
 * @author yiminghe@gmail.com
 */
KISSY.add('editor/plugin/unordered-list',['./list-utils/btn', './unordered-list/cmd'], function (S, require) {
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
