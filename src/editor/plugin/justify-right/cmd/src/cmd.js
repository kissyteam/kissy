/**
 * @ignore
 * Add justifyCenter command identifier for Editor.
 * @author yiminghe@gmail.com
 */

var justifyUtils = require('../justify-cmd');
module.exports = {
    init: function (editor) {
        justifyUtils.addCommand(editor, 'justifyRight', 'right');
    }
};