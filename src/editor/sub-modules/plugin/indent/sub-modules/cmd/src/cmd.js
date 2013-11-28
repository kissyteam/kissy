/**
 * @ignore
 * Add indent and outdent command identifier for KISSY Editor.
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var dentUtils = require('../dent-cmd');

    var addCommand = dentUtils.addCommand;
    return {
        init: function (editor) {
            addCommand(editor, 'indent');
        }
    };
});