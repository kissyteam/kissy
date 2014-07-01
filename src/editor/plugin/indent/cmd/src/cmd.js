/**
 * @ignore
 * Add indent and outdent command identifier for KISSY Editor.
 * @author yiminghe@gmail.com
 */

var dentUtils = require('../dent-cmd');

var addCommand = dentUtils.addCommand;

module.exports = {
    init: function (editor) {
        addCommand(editor, 'indent');
    }
};