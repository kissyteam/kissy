/**
 * @ignore
 * fontFamily command.
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Cmd = require('../font/cmd');

    var fontFamilyStyle = {
        element: 'span',
        styles: {
            'font-family': '#(value)'
        },
        overrides: [
            {
                element: 'font',
                attributes: {
                    'face': null
                }
            }
        ]
    };

    return {
        init: function (editor) {
            Cmd.addSelectCmd(editor, 'fontFamily', fontFamilyStyle);
        }
    };
});