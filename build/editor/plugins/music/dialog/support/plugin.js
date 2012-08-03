/**
 * music dialog
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("music/dialog/support", function() {
    var S = KISSY,
        KE = S.Editor,
        CLS_MUSIC = "ke_music",
        TYPE_MUSIC = 'music',
        TIP = "请输入如 http://xxx.com/xx.mp3";

    var music_reg = /#\(music\)/g,
        MIDDLE = "vertical-align:middle",

        bodyHtml = "<div style='padding:20px 20px 0 20px'>" +
            "<p>" +
            "<label>" +
            "网址： " +
            "<input " +
            " data-verify='^https?://[^\\s]+$' " +
            " data-warning='网址格式为：http://' " +
            "class='ke-music-url ke-input' style='width:300px;" +
            MIDDLE + "'  />" +
            "</label>" +
            "</p>" +
            "<p style='margin: 10px 0 10px 40px;'>" +
            "<label style='" + MIDDLE + "'>对齐： " +
            "<select class='ke-music-align' title='对齐'>" +
            "<option value='none'>无</option>" +
            "<option value='left'>左对齐</option>" +
            "<option value='right'>右对齐</option>" +
            "</select>" +
            "</label>" +
            "<label style='margin-left:25px;'>间距： " +
            "<input " +
            " data-verify='^\\d+$' " +
            " data-warning='间距请输入非负整数' " +
            "class='ke-music-margin ke-input' " +
            "style='width:60px;" +
            MIDDLE + "' value='"
            + 5 + "'/> 像素" +
            "</label>" +
            "</p>" +
            "</div>",
        footHtml = "<div style='padding:5px 20px 20px;'>" +
            "<a class='ke-music-ok ke-button' " +
            "style='margin:0 20px 0 40px;'>确定</a> " +
            "<a class='ke-music-cancel ke-button'>取消</a></div>";

    function getMusicUrl(url) {
        return url.replace(/^.+niftyplayer\.swf\?file=/, "");
    }

    function MusicDialog(editor) {
        MusicDialog['superclass'].constructor.apply(this, arguments);
    }

    KE.MusicInserter.Dialog = MusicDialog;


    S.extend(MusicDialog, KE.Flash.FlashDialog, {
        _config:function() {
            var self = this;
            self._cls = CLS_MUSIC;
            self._type = TYPE_MUSIC;
            self._title = "音乐";//属性";
            self._bodyHtml = bodyHtml;
            self._footHtml = footHtml;
            self._config_dwidth = "400px";
            self._urlTip = TIP;
        },
        _initD:function() {
            var self = this,
                d = self.dialog,
                el = d.get("el");
            self.dUrl = el.one(".ke-music-url");
            self.dAlign = KE.Select.decorate(el.one(".ke-music-align"));
            self.dMargin = el.one(".ke-music-margin");
            var action = el.one(".ke-music-ok"),
                cancel = el.one(".ke-music-cancel");
            action.on("click", self._gen, self);
            cancel.on("click", function(ev) {
                ev&&ev.halt();
                d.hide();
            });
            KE.Utils.placeholder(self.dUrl, self._urlTip);
             self.addRes(action,cancel,self.dUrl);
        },

        _getDInfo:function() {
            var self = this,
                editor = self.editor,
                cfg = editor.cfg.pluginConfig["music"] || {},
                MUSIC_PLAYER = cfg['musicPlayer'] || "niftyplayer.swf",
                MUSIC_PLAYER_CODE = MUSIC_PLAYER + '?file=#(music)';

            return {
                url: MUSIC_PLAYER_CODE.replace(music_reg, self.dUrl.val()),
                attrs:{
                    width:165,
                    height:37,
                    //align:self.dAlign.val(),
                    style:"margin:" + (parseInt(self.dMargin.val()) || 0) + "px;" +
                        "float:" + self.dAlign.val() + ";"
                }
            };
        },

        _getFlashUrl:function(r) {
            return   getMusicUrl(MusicDialog['superclass']
                ._getFlashUrl.call(this, r));
        },
        _updateD:function() {
            var self = this,
                editor = self.editor,
                f = self.selectedFlash;
            if (f) {
                var r = editor.restoreRealElement(f);
                KE.Utils.valInput(self.dUrl, self._getFlashUrl(r));
                self.dAlign.val(f.css("float"));
                self.dMargin.val(parseInt(r._4e_style("margin")) || 0);
            } else {
                KE.Utils.resetInput(self.dUrl);
                self.dAlign.val("none");
                self.dMargin.val("5");
            }
        }
    });
},{
    attach:false,
    requires:["flash/dialog/support"]
});