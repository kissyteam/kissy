/**
 * music button
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("music/support", function() {
    var S = KISSY,
        KE = S.Editor,
        Event = S.Event,
        Flash = KE.Flash,
        UA = S.UA;
    var CLS_MUSIC = "ke_music",
        TYPE_MUSIC = 'music';
    var flashRules = ["img." + CLS_MUSIC];

    function MusicInserter(editor) {
        MusicInserter['superclass'].constructor.apply(this, arguments);
        //只能ie能用？，目前只有firefox,ie支持图片缩放
        var disableObjectResizing = editor.cfg['disableObjectResizing'];
        if (!disableObjectResizing) {
            Event.on(editor.document.body,
                UA['ie'] ? 'resizestart' : 'resize',
                    function(evt) {
                        var t = new S.Node(evt.target);
                        if (t.hasClass(CLS_MUSIC))
                            evt.preventDefault();
                    });
        }
    }

    function checkMusic(node) {
        return  node._4e_name() === 'img' &&
            (!!node.hasClass(CLS_MUSIC)) && node;
    }

    function getMusicUrl(url) {
        return url.replace(/^.+niftyplayer\.swf\?file=/, "");
    }

    S.extend(MusicInserter, Flash, {
        _config:function() {
            var self = this;
            self._cls = CLS_MUSIC;
            self._type = TYPE_MUSIC;
            self._contextMenu = contextMenu;
            self._flashRules = flashRules;
        },
        _getFlashUrl:function() {
            return getMusicUrl(MusicInserter['superclass']._getFlashUrl.apply(this, arguments));
        }
    });


    Flash.registerBubble("music", "在新窗口查看", checkMusic);
    KE.MusicInserter = MusicInserter;
    var contextMenu = {
        "音乐属性":function(cmd) {
            var editor = cmd.editor,
                selection = editor.getSelection(),
                startElement = selection && selection.getStartElement(),
                flash = startElement && checkMusic(startElement);
            if (flash) {
                cmd.show(null, flash);
            }
        }
    };
}, {
    attach:false,
    "requires":["flash/support"]
});