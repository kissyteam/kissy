/**
 * video button.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/video", function (S, Editor, flashUtils, FlashBaseClass, fakeObjects) {
    var CLS_VIDEO = "ke_video",
        TYPE_VIDEO = "video";

    function video(config) {
        this.config = config;
    }

    S.augment(video, {
        pluginRenderUI: function (editor) {

            fakeObjects.init(editor);

            var dataProcessor = editor.htmlDataProcessor,
                dataFilter = dataProcessor && dataProcessor.dataFilter;

            var provider = [];

            function getProvider(url) {
                for (var i = 0;
                     i < provider.length;
                     i++) {
                    var p = provider[i];
                    if (p['reg'].test(url)) {
                        return p;
                    }
                }
                return undefined;
            }

            var videoCfg = this.config;

            if (videoCfg['providers']) {
                provider.push.apply(provider, videoCfg['providers']);
            }

            videoCfg.getProvider = getProvider;

            dataFilter && dataFilter.addRules({
                tags: {
                    'object': function (element) {
                        var classId = element.getAttribute("classid"), i;
                        var childNodes = element.childNodes;
                        if (!classId) {

                            // Look for the inner <embed>
                            for (i = 0; i < childNodes.length; i++) {
                                if (childNodes[ i ].nodeName == 'embed') {
                                    if (!flashUtils.isFlashEmbed(childNodes[ i ])) {
                                        return null;
                                    }
                                    if (getProvider(childNodes[ i ].getAttribute("src"))) {
                                        return dataProcessor.createFakeParserElement(element,
                                            CLS_VIDEO, TYPE_VIDEO, true);
                                    }
                                }
                            }
                            return null;
                        }
                        for (i = 0; i < childNodes.length; i++) {
                            var c = childNodes[ i ];
                            if (c.nodeName == 'param' &&
                                c.getAttribute("name").toLowerCase() == "movie") {
                                if (getProvider(c.getAttribute("value") ||
                                    c.getAttribute("VALUE"))) {
                                    return dataProcessor.createFakeParserElement(element,
                                        CLS_VIDEO, TYPE_VIDEO, true);
                                }
                            }
                        }

                    },

                    'embed': function (element) {
                        if (!flashUtils.isFlashEmbed(element))
                            return null;
                        if (getProvider(element.getAttribute("src"))) {
                            return dataProcessor.createFakeParserElement(element,
                                CLS_VIDEO, TYPE_VIDEO, true);
                        }

                    }
                    //4 比 flash 的优先级 5 高！
                }}, 4);


            var flashControl = new FlashBaseClass({
                editor: editor,
                cls: CLS_VIDEO,
                type: TYPE_VIDEO,
                pluginConfig: this.config,
                bubbleId: "video",
                contextMenuId: "video",
                contextMenuHandlers: {
                    "视频属性": function () {
                        var selectedEl = this.get("editorSelectedEl");
                        if (selectedEl) {
                            flashControl.show(selectedEl);
                        }
                    }
                }
            });

            editor.addButton("video", {
                tooltip: "插入视频",
                listeners: {
                    click: function () {
                        flashControl.show();

                    }
                },
                mode: Editor.Mode.WYSIWYG_MODE
            });
        }
    });


    return video;

}, {
    requires: ['editor', './flash-common/utils',
        './flash-common/base-class', './fake-objects']
});