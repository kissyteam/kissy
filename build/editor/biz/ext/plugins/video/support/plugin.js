KISSY.Editor.add("video/support", function() {
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