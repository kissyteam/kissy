/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:47
*/
/*
combined modules:
editor/plugin/maximize
*/
KISSY.add('editor/plugin/maximize', [
    './maximize/cmd',
    './button'
], function (S, require, exports, module) {
    /**
 * @ignore
 * Maximize plugin
 * @author yiminghe@gmail.com
 */
    var maximizeCmd = require('./maximize/cmd');
    require('./button');
    var MAXIMIZE_CLASS = 'maximize', RESTORE_CLASS = 'restore', MAXIMIZE_TIP = '\u5168\u5C4F', RESTORE_TIP = '\u53D6\u6D88\u5168\u5C4F';
    function MaximizePlugin() {
    }
    MaximizePlugin.prototype = {
        pluginRenderUI: function (editor) {
            maximizeCmd.init(editor);
            editor.addButton('maximize', {
                tooltip: MAXIMIZE_TIP,
                listeners: {
                    click: function () {
                        var self = this;
                        var checked = self.get('checked');
                        if (checked) {
                            editor.execCommand('maximizeWindow');
                            self.set('tooltip', RESTORE_TIP);
                            self.set('contentCls', RESTORE_CLASS);
                        } else {
                            editor.execCommand('restoreWindow');
                            self.set('tooltip', MAXIMIZE_TIP);
                            self.set('contentCls', MAXIMIZE_CLASS);
                        }
                        editor.focus();
                    }
                },
                checkable: true
            });
        }
    };
    module.exports = MaximizePlugin;
});

