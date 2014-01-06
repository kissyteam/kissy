/**
 * @ignore
 * Add flash plugin.
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Editor = require('editor');
    var FlashBaseClass = require('./flash-common/base-class');
    var flashUtils = require('./flash-common/utils');
    var fakeObjects = require('./fake-objects');
    require('./button');

    var CLS_FLASH = 'ke_flash',
        TYPE_FLASH = 'flash';

    function FlashPlugin(config) {
        this.config = config || {};
    }

    S.augment(FlashPlugin, {
        pluginRenderUI: function (editor) {
            fakeObjects.init(editor);

            var dataProcessor = editor.htmlDataProcessor,
                dataFilter = dataProcessor.dataFilter;

            dataFilter.addRules({
                    tags: {
                        'object': function (element) {
                            var classId = element.getAttribute('classid'), i;
                            if (!classId) {
                                var childNodes = element.childNodes;
                                // Look for the inner <embed>
                                for (i = 0; i < childNodes.length; i++) {
                                    if (childNodes[i].nodeName === 'embed') {
                                        if (!flashUtils.isFlashEmbed(childNodes[i][ i ])) {
                                            return dataProcessor
                                                .createFakeParserElement(element,
                                                    CLS_FLASH, TYPE_FLASH, true);
                                        } else {
                                            return null;
                                        }
                                    }
                                }
                                return null;
                            }
                            return dataProcessor.createFakeParserElement(element,
                                CLS_FLASH, TYPE_FLASH, true);
                        },
                        'embed': function (element) {
                            if (flashUtils.isFlashEmbed(element)) {
                                return dataProcessor
                                    .createFakeParserElement(element, CLS_FLASH, TYPE_FLASH, true);
                            } else {
                                return null;
                            }
                        }
                    }
                },
                5);


            var flashControl = new FlashBaseClass({
                editor: editor,
                cls: CLS_FLASH,
                type: TYPE_FLASH,
                pluginConfig: this.config,
                bubbleId: 'flash',
                contextMenuId: 'flash',
                contextMenuHandlers: {
                    'Flash属性': function () {
                        var selectedEl = this.get('editorSelectedEl');
                        if (selectedEl) {
                            flashControl.show(selectedEl);
                        }
                    }
                }
            });

            this.flashControl = flashControl;

            editor.addButton('flash', {
                tooltip: '插入Flash',
                listeners: {
                    click: function () {
                        flashControl.show();
                    }
                },
                mode: Editor.Mode.WYSIWYG_MODE
            });
        }
    });

    return FlashPlugin;
});