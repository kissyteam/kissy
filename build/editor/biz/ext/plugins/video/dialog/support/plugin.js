KISSY.Editor.add("video/dialog/support", function() {
    var S = KISSY,
        KE = S.Editor,
        Video = KE.Video,
        CLS_VIDEO = "ke_video",
        TYPE_VIDEO = "video",
        DTIP = "自动";


    var MIDDLE = "vertical-align:middle;",
        MARGIN_DEFAULT = 0;
    var bodyHtml = "<div style='padding:20px 20px 0 20px'>" +
        "<p>" +
        "<label>" +
        "链接： " +
        "" +
        "<input " +
        "class='ke-video-url ke-input' style='width:410px;" +
        MIDDLE + "'/>" +
        "</label>" +
        "</p>" +
        "<table " +
        "style='margin:10px 0 5px  40px;width:400px;'>" +
        "<tr><td>" +
        "<label>宽度： " +
        " " +
        "<input " +
        " data-verify='^(" + DTIP + "|((?!0$)\\d+))?$' " +
        " data-warning='宽度请输入正整数' " +
        "class='ke-video-width ke-input' " +
        "style='width:60px;margin-left:2px;" +
        MIDDLE + "' " +
        "/> 像素" +
        "</label>" +
        "</td>" +
        "<td>" +
        "<label> 高度： " +
        "" +
        " <input " +
        " data-verify='^(" + DTIP + "|((?!0$)\\d+))?$' " +
        " data-warning='高度请输入正整数' " +
        "class='ke-video-height ke-input' style='width:60px;" +
        MIDDLE +
        "'/> 像素" +
        "</label>" +
        "</td></tr>" +
        "<tr>" +
        "<td>" +
        "<label>对齐： " +
        "<select class='ke-video-align' title='对齐'>" +
        "<option value='none'>无</option>" +
        "<option value='left'>左对齐</option>" +
        "<option value='right'>右对齐</option>" +
        "</select>" +
        "</td>" +
        "<td>" +
        "<label>间距： " +
        "<input " +
        "" +
        " data-verify='^\\d+$' " +
        " data-warning='间距请输入非负整数' " +
        "class='ke-video-margin ke-input' style='width:60px;" +
        MIDDLE + "' value='"
        + MARGIN_DEFAULT + "'/> 像素" +
        "</label>" +
        "</td></tr>" +
        "</table>" +
        "</div>",

        footHtml = "<div style='padding:5px 20px 20px;'><a " +
            "class='ke-video-ok ke-button' " +
            "style='margin-left:40px;margin-right:20px;'>确定</button> " +
            "<a class='ke-video-cancel ke-button'>取消</a></div>";

    function VideoDialog() {
        VideoDialog['superclass'].constructor.apply(this, arguments);
    }

    S.extend(VideoDialog, KE.Flash.FlashDialog, {
        _config:function() {
            var self = this,
                editor = self.editor,
                cfg = editor.cfg.pluginConfig;
            self._cls = CLS_VIDEO;
            self._type = TYPE_VIDEO;
            self._title = "视频";//属性";
            self._bodyHtml = bodyHtml;
            self._footHtml = footHtml;
            self.urlCfg = cfg["video"] &&
                cfg["video"].urlCfg;
            self._urlTip = (cfg["video"] &&
                cfg["video"]['urlTip']) || "请输入视频播放链接...";
        },
        _initD:function() {
            var self = this,
                d = self.dialog,
                el = d.get("el");
            self.dUrl = el.one(".ke-video-url");
            self.dAlign = KE.Select.decorate(el.one(".ke-video-align"));
            self.dMargin = el.one(".ke-video-margin");
            self.dWidth = el.one(".ke-video-width");
            self.dHeight = el.one(".ke-video-height");
            var action = el.one(".ke-video-ok"),
                cancel = el.one(".ke-video-cancel");
            action.on("click", self._gen, self);
            cancel.on("click", function(ev) {
                d.hide();
                ev.halt();
            });
            KE.Utils.placeholder(self.dUrl, self._urlTip);
            KE.Utils.placeholder(self.dWidth, DTIP);
            KE.Utils.placeholder(self.dHeight, DTIP);
            self.addRes(action, cancel, self.dUrl, self.dWidth, self.dHeight);
        },

        _getDInfo:function() {

            var self = this,
                url = self.dUrl.val(),
                editor = self.editor,
                cfg = editor.cfg.pluginConfig;
            cfg["video"] = cfg["video"] || {};
            var videoCfg = cfg["video"],
                p = videoCfg.getProvider(url);
            if (!p) {
                alert("不支持该链接来源!");
            } else {
                var re = p['detect'](url);
                if (!re) {
                    alert("不支持该链接，请直接输入该视频提供的分享链接");
                    return;
                }
                return {
                    url:re,
                    attrs:{
                        height:parseInt(self.dHeight.val()) || p.height,
                        width:parseInt(self.dWidth.val()) || p.width,
                        style:"margin:" + (parseInt(self.dMargin.val()) || 0) + "px;" +
                            "float:" + self.dAlign.val() + ";"
                    }
                };
            }
        },

        _gen:function(ev) {
            var self = this,
                url = self.dUrl.val(),
                urlCfg = self.urlCfg;
            if (urlCfg) {
                for (var i = 0; i < urlCfg.length; i++) {
                    var c = urlCfg[i];
                    if (c['reg'].test(url)) {
                        self.dialog.loading();
                        //return;
                        Video.dynamicUrl.origin = url;
                        Video.dynamicUrl.instance = self;
                        setTimeout(function() {
                            S.getScript(
                                c.url
                                    //("/json.js?t=" + new Date())
                                    .replace(/@url@/,
                                    //"X"
                                    encodeURIComponent(url)
                                )
                                    .replace(/@callback@/,
                                    encodeURIComponent("KISSY.Editor.Video.dynamicUrl"))
                                //.replace(/@rand@/,
                                //(new Date().valueOf()))
                            );
                            //ie 必须延迟处理？？
                        }, 30);
                        return;
                    }
                }
            }
            VideoDialog['superclass']._gen.call(self);
            ev && ev.halt();
        },

        _dynamicUrlPrepare:function(re) {
            var self = this;
            self.dUrl.val(re);
            self.dialog.unloading();
            VideoDialog['superclass']._gen.call(self);
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
                KE.Utils.valInput(self.dWidth, parseInt(f.css("width")));
                KE.Utils.valInput(self.dHeight, parseInt(f.css("height")));
            } else {
                KE.Utils.resetInput(self.dUrl);
                self.dAlign.val("none");
                self.dMargin.val(MARGIN_DEFAULT);
                KE.Utils.resetInput(self.dWidth);
                KE.Utils.resetInput(self.dHeight);
            }
        }
    });
    Video.dynamicUrl = function(origin, re) {
        if (S.trim(origin) != S.trim(Video.dynamicUrl.origin)) return;
        Video.dynamicUrl.instance._dynamicUrlPrepare(re);
    };
    Video.Dialog = VideoDialog;
}, {
    attach:false
});