/**
 * @ignore
 * Add justifyCenter command identifier for Editor.
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var justifyUtils = require('../justify-cmd');
    return {
        init: function (editor) {
            justifyUtils.addCommand(editor, 'justifyLeft', 'left');
        }
    };
});