KISSY.Editor.add("xiami-music/support", function() {
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
});