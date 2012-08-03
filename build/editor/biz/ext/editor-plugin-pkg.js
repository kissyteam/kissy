/**
 * biz plugin , xiami music intergration
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("xiami-music", function(editor) {
    var S = KISSY,
        KE = S.Editor,
        CLS_XIAMI = "ke_xiami",
        TYPE_XIAMI = "xiami-music",
        dataProcessor = editor.htmlDataProcessor,
        dataFilter = dataProcessor && dataProcessor.dataFilter;

    function checkXiami(url) {
        return /xiami\.com/i.test(url);
    }

    dataFilter && dataFilter.addRules({
        elements : {
            'object' : function(element) {
                var attributes = element.attributes,
                    //增加音乐名字提示
                    title = element.attributes.title,
                    i,
                    c,
                    classId = attributes['classid']
                        && String(attributes['classid']).toLowerCase();
                if (!classId) {
                    // Look for the inner <embed>
                    for (i = 0; i < element.children.length; i++) {
                        c = element.children[ i ];
                        if (c.name == 'embed') {
                            if (!KE.Utils.isFlashEmbed(c))
                                return null;
                            if (checkXiami(c.attributes.src)) {
                                return dataProcessor.createFakeParserElement(element,
                                    CLS_XIAMI, TYPE_XIAMI, true, {
                                    title:title
                                });
                            }
                        }
                    }
                    return null;
                }
                for (i = 0; i < element.children.length; i++) {
                    c = element.children[ i ];
                    //innerHTML 会莫名首字母大写，还会加入一些属性
                    //Movie
                    if (c.name == 'param'
                        && c.attributes.name.toLowerCase() == "movie") {
                        if (checkXiami(c.attributes.value)) {
                            return dataProcessor.createFakeParserElement(element,
                                CLS_XIAMI, TYPE_XIAMI, true, {
                                title:title
                            });
                        }
                    }
                }
            },

            'embed' : function(element) {
                if (!KE.Utils.isFlashEmbed(element))
                    return null;
                if (checkXiami(element.attributes.src)) {
                    return dataProcessor.createFakeParserElement(element,
                        CLS_XIAMI, TYPE_XIAMI, true, {
                        title:element.attributes.title
                    });
                }
            }
            //4 比 flash 的优先级 5 高！
        }}, 4);

    editor.addPlugin("xiami-music", function() {
        var context = editor.addButton("xiami-music", {
            contentCls:"ke-toolbar-music",
            title:"插入虾米音乐" ,
            mode:KE.WYSIWYG_MODE,
            loading:true
        });

        KE.use("xiami-music/support", function() {
            var music = new KE.XiamiMusic(editor);
            context.reload({
                offClick:function() {
                    music.show();
                },
                destroy:function() {
                    music.destroy();
                }
            });
        });

        this.destroy = function() {
            context.destroy();
        }
    });

},
{
    attach:false,
    requires : ["fakeobjects"]
});KISSY.Editor.add("xiami-music/support", function() {
    var S = KISSY,
        UA = S.UA,
        CLS_XIAMI = "ke_xiami",
        TYPE_XIAMI = "xiami-music",
        Event = S.Event,
        KE = S.Editor;

    function XiamiMusic(editor) {
        XiamiMusic['superclass'].constructor.apply(this, arguments);
        //只能ie能用？，目前只有firefox,ie支持图片缩放
        var disableObjectResizing = editor.cfg['disableObjectResizing'];
        if (!disableObjectResizing) {
            Event.on(editor.document.body,
                UA['ie'] ? 'resizestart' : 'resize',
                    function(evt) {
                        var t = new S.Node(evt.target);
                        if (t.hasClass(CLS_XIAMI))
                            evt.preventDefault();
                    });
        }
    }

    S.extend(XiamiMusic, KE.Flash, {
        _config:function() {
            var self = this;
            self._cls = CLS_XIAMI;
            self._type = TYPE_XIAMI;
            self._contextMenu = contextMenu;
            self._flashRules = ["img." + CLS_XIAMI];
        },
        _updateTip:function(tipurl, selectedFlash) {
            var self = this,
                editor = self.editor,
                r = editor.restoreRealElement(selectedFlash);
            if (!r)return;
            tipurl.html(selectedFlash.attr("title"));
            tipurl.attr("href", self._getFlashUrl(r));
        }
    });
    function checkXiami(node) {
        return node._4e_name() === 'img' &&
            (!!node.hasClass(CLS_XIAMI)) &&
            node;
    }

    var contextMenu = {
        "虾米属性":function(cmd) {
            var editor = cmd.editor,
                selection = editor.getSelection(),
                startElement = selection && selection.getStartElement(),
                flash = checkXiami(startElement);
            if (flash) {
                cmd.show(null, flash);
            }
        }
    };
    KE.Flash.registerBubble(TYPE_XIAMI, "在新窗口查看", checkXiami);
    KE.XiamiMusic = XiamiMusic;

    KE.add({
        "xiami-music/dialog":{
            attach: false,
            charset:"utf-8",
            fullpath:KE.Utils.debugUrl(
                "../biz/ext/plugins/music/" +
                    "dialog/plugin.js"
                )
        }
    });

    KE.add({
        "xiami-music/dialog/support":{
            attach: false,
            charset:"utf-8",
            requires:["flash/dialog/support"],
            fullpath:KE.Utils.debugUrl(
                "../biz/ext/plugins/music/" +
                    "dialog/support/plugin.js"
                )
        }
    });
}, {
    attach:false,
    requires:["flash/support"]
});/**
 * checkbox source editor for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("checkbox-sourcearea", function(editor) {
    var KE = KISSY.Editor,
        S = KISSY,
        UA = S.UA;
    //firefox 3.5 不支持，有bug
    if (UA.gecko < 1.92) return;
    KE.use("checkbox-sourcearea/support", function() {
        var a=new KE.CheckboxSourceArea(editor);
        editor.on("destroy",function(){
           a.destroy();
        });
    });
},
{
    attach:false
});
/**
 * checkbox source editor for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("checkbox-sourcearea/support", function() {
    var S = KISSY,
        KE = S.Editor,
        Node = S.Node;

    var SOURCE_MODE = KE.SOURCE_MODE ,
        WYSIWYG_MODE = KE.WYSIWYG_MODE;

    function CheckboxSourceArea(editor) {
        this.editor = editor;
        this._init();
    }

    S.augment(CheckboxSourceArea, {
        _init:function() {
            var self = this,
                editor = self.editor,
                statusDiv = editor.statusDiv;
            self.holder = new Node("<span " +
                "style='zoom:1;display:inline-block;height:22px;line-height:22px;'>" +
                "<input style='margin:0 5px;vertical-align:middle;' " +
                "type='checkbox' />" +
                "<span style='vertical-align:middle;'>编辑源代码</span></span>")
                .appendTo(statusDiv);
            self.el = self.holder.one("input");
            var el = self.el;
            el.on("click", self._check, self);
            editor.on("sourcemode", function() {
                el[0].checked = true;
            });
            editor.on("wysiwygmode", function() {
                el[0].checked = false;
            });
        },
        _check:function() {
            var self = this,el = self.el;
            if (el[0].checked) self._show();
            else self._hide();
            //ev && ev.stopPropagation();
        },
        _show:function() {
            var self = this,
                editor = self.editor;
            KE.SourceAreaSupport.exec(editor, SOURCE_MODE);
        },


        _hide:function() {
            var self = this,
                editor = self.editor;
            KE.SourceAreaSupport.exec(editor, WYSIWYG_MODE);
        },

        destroy:function() {
            this.el.detach();
            this.holder.remove();
        }
    });
    KE.CheckboxSourceArea = CheckboxSourceArea;
},
{
    attach:false,
    requires : ["sourcearea/support"]
});
KISSY.Editor.add("multi-upload", function(editor) {
    var S = KISSY,
        KE = S.Editor;

    if (!KE['Env']['mods']["multi-upload/dialog"]) {
        KE.add({
            "multi-upload/dialog":{
                attach: false,
                charset:"utf-8",
                fullpath:KE.Utils.debugUrl(
                    "../biz/ext/plugins/upload/" +
                        "dialog/plugin.js"
                    )
            }
        });


        KE.add({
            "multi-upload/dialog/support":{
                attach: false,
                charset:"utf-8",
                requires:["progressbar","localstorage","overlay"],
                fullpath:KE.Utils.debugUrl(
                    "../biz/ext/plugins/upload/" +
                        "dialog/support/plugin.js"
                    )
            }
        });
    }

    editor.addPlugin("multi-upload", function() {
        var context = editor.addButton("multi-upload", {
            contentCls:"ke-toolbar-mul-image",
            title:"批量插图",
            mode:KE.WYSIWYG_MODE,
            offClick:function() {
                var editor = this.editor;
                editor.showDialog("multi-upload/dialog");
            },
            destroy:function() {
                this.editor.destroyDialog("multi-upload/dialog");
            }
        });

        this.destroy = function() {
            context.destroy();
        };
    });

}, {
    attach:false
});/**
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
});KISSY.Editor.add("video/support", function() {
    var S = KISSY,KE = S.Editor,
        Flash = KE.Flash,
        CLS_VIDEO = "ke_video",
        TYPE_VIDEO = "video";

    var flashRules = ["img." + CLS_VIDEO];

    function Video(editor) {
        Video['superclass'].constructor.apply(this, arguments);
    }

    Video.CLS_VIDEO = CLS_VIDEO;
    Video.TYPE_VIDEO = TYPE_VIDEO;

    S.extend(Video, Flash, {
        _config:function() {
            var self = this;
            self._cls = CLS_VIDEO;
            self._type = TYPE_VIDEO;
            self._contextMenu = contextMenu;
            self._flashRules = flashRules;
        }
    });

    function checkVideo(node) {
        return node._4e_name() === 'img'
            && (!!node.hasClass(CLS_VIDEO)) && node;
    }

    Flash.registerBubble("video", "在新窗口查看", checkVideo);
    KE.Video = Video;
    var contextMenu = {
        "视频属性":function(cmd) {
            var editor = cmd.editor,
                selection = editor.getSelection(),
                startElement = selection && selection.getStartElement(),
                flash = startElement && checkVideo(startElement);
            if (flash) {
                cmd.show(null, flash);
            }
        }
    };

    KE.add({
        "video/dialog":{
            attach: false,
            charset:"utf-8",
            fullpath:KE.Utils.debugUrl(
                "../biz/ext/plugins/video/" +
                    "dialog/plugin.js")
        }
    });

    KE.add({
        "video/dialog/support":{
            attach: false,
            charset:"utf-8",
            requires:["flash/dialog/support"],
            fullpath:KE.Utils.debugUrl("../biz/ext/plugins/video/" +
                "dialog/support/plugin.js")
        }
    });

}, {
    attach:false,
    requires:["flash/support"]
});