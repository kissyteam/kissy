/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 30 20:27
*/
/**
 * Add flash plugin.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/flash/index", function (S, Editor, FlashBaseClass, flashUtils) {

    var CLS_FLASH = 'ke_flash',
        TYPE_FLASH = 'flash';

    return {
        init:function (editor) {
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


            var pluginConfig = editor.get("pluginConfig").flash || {},
                flashControl = new FlashBaseClass({
                    editor:editor,
                    cls:CLS_FLASH,
                    type:TYPE_FLASH,
                    contextMenuHandlers:{
                        "Flash属性":function () {
                            var selectedEl = this.selectedEl;
                            if (selectedEl) {
                                flashControl.show(selectedEl);
                            }
                        }
                    }
                });

            if (pluginConfig.btn !== false) {
                editor.addButton({
                    contentCls:"ke-toolbar-flash",
                    title:"插入Flash",
                    mode:Editor.WYSIWYG_MODE
                }, {
                    offClick:function () {
                        flashControl.show();
                    }
                });
            }
        }
    };

}, {
    requires:['editor', '../flashCommon/baseClass', '../flashCommon/utils']
});
