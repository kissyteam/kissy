/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:46
*/
/*
combined modules:
editor/plugin/heading
*/
KISSY.add('editor/plugin/heading', [
    './menubutton',
    'editor',
    './heading/cmd'
], function (S, require, exports, module) {
    /**
 * @ignore
 * Heading plugin for KISSY.
 * @author yiminghe@gmail.com
 */
    require('./menubutton');
    var Editor = require('editor');
    var headingCmd = require('./heading/cmd');
    function HeadingPlugin() {
    }
    HeadingPlugin.prototype = {
        pluginRenderUI: function (editor) {
            headingCmd.init(editor);
            var FORMAT_SELECTION_ITEMS = [], FORMATS = {
                    '\u666E\u901A\u6587\u672C': 'p',
                    '\u6807\u98981': 'h1',
                    '\u6807\u98982': 'h2',
                    '\u6807\u98983': 'h3',
                    '\u6807\u98984': 'h4',
                    '\u6807\u98985': 'h5',
                    '\u6807\u98986': 'h6'
                }, FORMAT_SIZES = {
                    p: '1em',
                    h1: '2em',
                    h2: '1.5em',
                    h3: '1.17em',
                    h4: '1em',
                    h5: '0.83em',
                    h6: '0.67em'
                };
            for (var p in FORMATS) {
                FORMAT_SELECTION_ITEMS.push({
                    content: p,
                    value: FORMATS[p],
                    elAttrs: { style: 'font-size:' + FORMAT_SIZES[FORMATS[p]] }
                });
            }
            editor.addSelect('heading', {
                defaultCaption: '\u6807\u9898',
                width: '120px',
                menu: { children: FORMAT_SELECTION_ITEMS },
                mode: Editor.Mode.WYSIWYG_MODE,
                listeners: {
                    click: function (ev) {
                        var v = ev.target.get('value');
                        editor.execCommand('heading', v);
                    },
                    afterSyncUI: function () {
                        var self = this;
                        editor.on('selectionChange', function () {
                            if (editor.get('mode') === Editor.Mode.SOURCE_MODE) {
                                return;
                            }    // For each element into the elements path.
                                 // Check if the element is removable by any of
                                 // the styles.
                            // For each element into the elements path.
                            // Check if the element is removable by any of
                            // the styles.
                            var headingValue = editor.queryCommandValue('heading'), value;
                            for (value in FORMAT_SIZES) {
                                if (value === headingValue) {
                                    self.set('value', value);
                                    return;
                                }
                            }
                            self.set('value', null);
                        });
                    }
                }
            });
        }
    };
    module.exports = HeadingPlugin;
});


