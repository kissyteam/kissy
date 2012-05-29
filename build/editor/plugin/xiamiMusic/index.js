/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 28 19:44
*/
KISSY.add("editor/plugin/xiamiMusic/index", function (S, Editor, FlashBaseClass, flashUtils) {
    var CLS_XIAMI = "ke_xiami",
        TYPE_XIAMI = "xiamiMusic";

    function XiamiMusic() {
        XiamiMusic.superclass.constructor.apply(this, arguments);
    }

    S.extend(XiamiMusic, FlashBaseClass, {
        _updateTip:function (tipUrlEl, selectedFlash) {
            var self = this,
                editor = self.get("editor"),
                r = editor.restoreRealElement(selectedFlash);
            if (r) {
                tipUrlEl.html(selectedFlash.attr("title"));
                tipUrlEl.attr("href", self._getFlashUrl(r));
            }
        }
    });

    return {
        init:function (editor) {


            var dataProcessor = editor.htmlDataProcessor,
                dataFilter = dataProcessor && dataProcessor.dataFilter;

            function checkXiami(url) {
                return /xiami\.com/i.test(url);
            }

            dataFilter && dataFilter.addRules({
                tags:{
                    'object':function (element) {
                        var //增加音乐名字提示
                            title = element.getAttribute("title"),
                            i,
                            c,
                            classId = element.getAttribute("classid");
                        var childNodes = element.childNodes;
                        if (!classId) {
                            // Look for the inner <embed>
                            for (i = 0; i < childNodes.length; i++) {
                                c = childNodes[ i ];
                                if (c.nodeName == 'embed') {
                                    if (!flashUtils.isFlashEmbed(c)) {
                                        return null;
                                    }
                                    if (checkXiami(c.attributes.src)) {
                                        return dataProcessor.createFakeParserElement(element, CLS_XIAMI, TYPE_XIAMI, true, {
                                            title:title
                                        });
                                    }
                                }
                            }
                            return null;
                        }
                        for (i = 0; i < childNodes.length; i++) {
                            c = childNodes[ i ];
                            //innerHTML 会莫名首字母大写，还会加入一些属性
                            //Movie
                            if (c.nodeName == 'param'
                                && c.getAttribute("name") == "movie") {
                                if (checkXiami(c.getAttribute("value"))) {
                                    return dataProcessor.createFakeParserElement(element,
                                        CLS_XIAMI, TYPE_XIAMI, true, {
                                            title:title
                                        });
                                }
                            }
                        }
                    },

                    'embed':function (element) {
                        if (flashUtils.isFlashEmbed(element) &&
                            checkXiami(element.getAttribute("src"))) {
                            return dataProcessor.createFakeParserElement(element,
                                CLS_XIAMI, TYPE_XIAMI, true, {
                                    title:element.getAttribute("title")
                                });
                        }
                    }
                    //4 比 flash 的优先级 5 高！
                }}, 4);

            var xiamiMusic = new XiamiMusic({
                editor:editor,
                cls:CLS_XIAMI,
                type:TYPE_XIAMI,
                contextMenuHandlers:{
                    "虾米属性":function () {
                        var selectedEl = this.selectedEl;
                        if (selectedEl) {
                            xiamiMusic.show(selectedEl);
                        }
                    }
                }
            });


            editor.addButton({
                contentCls:"ke-toolbar-music",
                title:"插入虾米音乐",
                mode:Editor.WYSIWYG_MODE
            }, {
                offClick:function () {
                    xiamiMusic.show();
                }
            });

        }
    };

}, {
    requires:['editor', '../flashCommon/baseClass', '../flashCommon/utils']
});
