/**
 * @ignore
 * fontSize command.
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Cmd = require('../font/cmd');

    var fontSizeStyle = {
        element: 'span',
        styles: {
            'font-size': '#(value)'
        },
        overrides: [
            {
                element: 'font',
                attributes: {
                    'size': null
                }
            }
        ]
    };

    return {
        init: function (editor) {
            Cmd.addSelectCmd(editor, 'fontSize', fontSizeStyle);
        }
    };
});