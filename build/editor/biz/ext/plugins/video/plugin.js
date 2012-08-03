/**
 * biz plugin , video about ku6,youku,tudou
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("video", function(editor) {
    var S = KISSY,
        KE = S.Editor,
        dataProcessor = editor.htmlDataProcessor,
        dataFilter = dataProcessor && dataProcessor.dataFilter;

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

    var provider = [];

    var cfg = editor.cfg.pluginConfig;
    cfg["video"] = cfg["video"] || {};
    var videoCfg = cfg["video"];
    if (videoCfg['providers']) {
        provider.push.apply(provider, videoCfg['providers']);
    }
    videoCfg.getProvider = getProvider;
    var CLS_VIDEO = "ke_video",
        TYPE_VIDEO = "video";

    dataFilter && dataFilter.addRules({
        elements : {
            'object' : function(element) {
                var attributes = element.attributes,i,
                    classId = attributes['classid']
                        && String(attributes['classid']).toLowerCase();
                if (!classId) {
                    // Look for the inner <embed>
                    for (i = 0; i < element.children.length; i++) {
                        if (element.children[ i ].name == 'embed') {
                            if (!KE.Utils.isFlashEmbed(element.children[ i ]))
                                return null;
                            if (getProvider(element.children[ i ].attributes.src)) {
                                return dataProcessor.createFakeParserElement(element,
                                    CLS_VIDEO, TYPE_VIDEO, true);
                            }
                        }
                    }
                    return null;
                }
                for (i = 0; i < element.children.length; i++) {
                    var c = element.children[ i ];
                    if (c.name == 'param' && c.attributes.name.toLowerCase() == "movie") {
                        if (getProvider(c.attributes.value)) {
                            return dataProcessor.createFakeParserElement(element,
                                CLS_VIDEO, TYPE_VIDEO, true);
                        }
                    }
                }

            },

            'embed' : function(element) {
                if (!KE.Utils.isFlashEmbed(element))
                    return null;
                if (getProvider(element.attributes.src)) {
                    return dataProcessor.createFakeParserElement(element,
                        CLS_VIDEO, TYPE_VIDEO, true);
                }

            }
            //4 比 flash 的优先级 5 高！
        }}, 4);

    editor.addPlugin("video", function() {
        var context = editor.addButton("video", {
            contentCls:"ke-toolbar-video",
            title:"插入视频" ,
            mode:KE.WYSIWYG_MODE,
            loading:true
        });

        KE.use("video/support", function() {
            var video = new KE.Video(editor);
            context.reload({
                offClick:function() {
                    video.show();
                },
                destroy:function() {
                    video.destroy();
                }
            });
        });

        this.destroy = function() {
            context.destroy();
        };
    });

}, {
    attach:false,
    requires:["fakeobjects"]
});