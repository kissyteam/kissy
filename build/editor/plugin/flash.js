﻿/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 3 13:51
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/flash
*/

/**
 * Add flash plugin.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/flash", function (S, Editor, FlashBaseClass, flashUtils, fakeObjects) {

    var CLS_FLASH = 'ke_flash',
        TYPE_FLASH = 'flash';

    function FlashPlugin(config) {
        this.config = config || {};
    }

    S.augment(FlashPlugin, {
        pluginRenderUI:function (editor) {

            fakeObjects.init(editor);

            var dataProcessor = editor.htmlDataProcessor,
                dataFilter = dataProcessor.dataFilter;

            dataFilter.addRules({
                    tags:{
                        'object':function (element) {
                            var classId = element.getAttribute("classid"), i;
                            if (!classId) {
                                var childNodes = element.childNodes;
                                // Look for the inner <embed>
                                for (i = 0; i < childNodes.length; i++) {
                                    if (childNodes[i].nodeName == 'embed') {
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
                        'embed':function (element) {
                            if (flashUtils.isFlashEmbed(element)) {
                                return dataProcessor
                                    .createFakeParserElement(element, CLS_FLASH, TYPE_FLASH, true);
                            } else {
                                return null;
                            }
                        }
                    }},
                5);


            var flashControl = new FlashBaseClass({
                editor:editor,
                cls:CLS_FLASH,
                type:TYPE_FLASH,
                pluginConfig:this.config,
                bubbleId:"flash",
                contextMenuId:'flash',
                contextMenuHandlers:{
                    "Flash属性":function () {
                        var selectedEl = this.get("editorSelectedEl");
                        if (selectedEl) {
                            flashControl.show(selectedEl);
                        }
                    }
                }
            });

            this.flashControl = flashControl;

            editor.addButton("flash", {
                tooltip:"插入Flash",
                listeners:{
                    click:function () {
                        flashControl.show();
                    }
                },
                mode:Editor.Mode.WYSIWYG_MODE
            });
        }
//       ,
//
//        destructor:function () {
//            this.flashControl.destroy();
//        }
    });

    return FlashPlugin;

}, {
    requires:['editor', './flash-common/base-class', './flash-common/utils', './fake-objects']
});

