/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:48
*/
/*
combined modules:
editor/plugin/source-area
*/
KISSY.add('editor/plugin/source-area', [
    'editor',
    './button'
], function (S, require, exports, module) {
    /**
 * @ignore
 * source editor for kissy editor
 * @author yiminghe@gmail.com
 */
    var Editor = require('editor');
    require('./button');
    var SOURCE_MODE = Editor.Mode.SOURCE_MODE, WYSIWYG_MODE = Editor.Mode.WYSIWYG_MODE;
    function SourceArea() {
    }
    SourceArea.prototype = {
        pluginRenderUI: function (editor) {
            editor.addButton('sourceArea', {
                tooltip: '\u6E90\u7801',
                listeners: {
                    afterSyncUI: function () {
                        var self = this;
                        editor.on('wysiwygMode', function () {
                            self.set('checked', false);
                        });
                        editor.on('sourceMode', function () {
                            self.set('checked', true);
                        });
                    },
                    click: function () {
                        var self = this;
                        var checked = self.get('checked');
                        if (checked) {
                            editor.set('mode', SOURCE_MODE);
                        } else {
                            editor.set('mode', WYSIWYG_MODE);
                        }
                    }
                },
                checkable: true
            });
        }
    };
    module.exports = SourceArea;
});

