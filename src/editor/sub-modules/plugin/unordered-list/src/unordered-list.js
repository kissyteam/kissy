/**
 * @ignore
 * Add ul/ol button.
 * @author yiminghe@gmail.com
 */

var ListButton = require('./list-utils/btn');
var ListCmd = require('./unordered-list/cmd');

function UnorderedList() {
}

UnorderedList.prototype = {
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
};

module.exports = UnorderedList;
