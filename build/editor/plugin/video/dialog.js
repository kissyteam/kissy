/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Aug 20 15:10
*/
/**
 * video dialog
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/video/dialog", function (S, Editor, FlashDialog, MenuButton) {
    var CLS_VIDEO = "ke_video",
        TYPE_VIDEO = "video",
        DTIP = "自动",
        MARGIN_DEFAULT = 0,
        bodyHtml = "<div style='padding:20px 20px 0 20px'>" +
            "<p>" +
            "<label>" +
            "链接： " +
            "" +
            "<input " +
            "class='ks-editor-video-url ks-editor-input' style='width:410px;" +
            "'/>" +
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
            "class='ks-editor-video-width ks-editor-input' " +
            "style='width:60px;" +
            "' " +
            "/> 像素" +
            "</label>" +
            "</td>" +
            "<td>" +
            "<label> 高度： " +
            "" +
            " <input " +
            " data-verify='^(" + DTIP + "|((?!0$)\\d+))?$' " +
            " data-warning='高度请输入正整数' " +
            "class='ks-editor-video-height ks-editor-input' style='width:60px;" +
            "'/> 像素" +
            "</label>" +
            "</td></tr>" +
            "<tr>" +
            "<td>" +
            "<label>对齐： " +
            "<select class='ks-editor-video-align' title='对齐'>" +
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
            "class='ks-editor-video-margin ks-editor-input' style='width:60px;" +
            "' value='"
            + MARGIN_DEFAULT + "'/> 像素" +
            "</label>" +
            "</td></tr>" +
            "</table>" +
            "</div>",
        footHtml = "<div style='padding:5px 20px 20px;'><a " +
            "class='ks-editor-video-ok ks-editor-button ks-inline-block' " +
            "style='margin-left:40px;margin-right:20px;'>确定</button> " +
            "<a class='ks-editor-video-cancel ks-editor-button ks-inline-block'>取消</a></div>";

    function VideoDialog() {
        VideoDialog.superclass.constructor.apply(this, arguments);
    }

    S.extend(VideoDialog, FlashDialog, {
        _config:function () {
            var self = this,
                cfg = self.config;
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
        _initD:function () {
            var self = this,
                d = self.dialog,
                el = d.get("el");
            self.dUrl = el.one(".ks-editor-video-url");
            self.dAlign = MenuButton.Select.decorate(el.one(".ks-editor-video-align"), {
                prefixCls:'ks-editor-big-',
                width:80,
                menuCfg:{
                    prefixCls:'ks-editor-',
                    render:el
                }
            });
            self.dMargin = el.one(".ks-editor-video-margin");
            self.dWidth = el.one(".ks-editor-video-width");
            self.dHeight = el.one(".ks-editor-video-height");
            var action = el.one(".ks-editor-video-ok"),
                cancel = el.one(".ks-editor-video-cancel");
            action.on("click", self._gen, self);
            cancel.on("click", function (ev) {
                d.hide();
                ev.halt();
            });
            Editor.Utils.placeholder(self.dUrl, self._urlTip);
            Editor.Utils.placeholder(self.dWidth, DTIP);
            Editor.Utils.placeholder(self.dHeight, DTIP);
            self.addRes(self.dAlign);
        },

        _getDInfo:function () {
            var self = this,
                url = self.dUrl.val();
            var videoCfg = self.config,
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
                            "float:" + self.dAlign.get("value") + ";"
                    }
                };
            }
        },

        _gen:function (ev) {
            var self = this,
                url = self.dUrl.val(),
                urlCfg = self.urlCfg;
            if (urlCfg) {
                for (var i = 0; i < urlCfg.length; i++) {
                    var c = urlCfg[i];
                    if (c['reg'].test(url)) {
                        self.dialog.loading();

                        var data = {};

                        data[c['paramName'] || "url"] = url;

                        S.io({
                            url:c.url,
                            data:data,
                            dataType:'jsonp',
                            success:function (data) {
                                self._dynamicUrlPrepare(data[1]);
                            }
                        });

                        return;
                    }
                }
            }
            VideoDialog.superclass._gen.call(self);
            ev && ev.halt();
        },

        _dynamicUrlPrepare:function (re) {
            var self = this;
            self.dUrl.val(re);
            self.dialog.unloading();
            VideoDialog.superclass._gen.call(self);
        },

        _updateD:function () {
            var self = this,
                editor = self.editor,
                f = self.selectedFlash;
            if (f) {
                var r = editor.restoreRealElement(f);
                Editor.Utils.valInput(self.dUrl, self._getFlashUrl(r));
                self.dAlign.set("value", f.css("float"));
                self.dMargin.val(parseInt(r.style("margin")) || 0);
                Editor.Utils.valInput(self.dWidth, parseInt(f.css("width")));
                Editor.Utils.valInput(self.dHeight, parseInt(f.css("height")));
            } else {
                Editor.Utils.resetInput(self.dUrl);
                self.dAlign.set("value", "none");
                self.dMargin.val(MARGIN_DEFAULT);
                Editor.Utils.resetInput(self.dWidth);
                Editor.Utils.resetInput(self.dHeight);
            }
        }
    });

    return VideoDialog;
}, {
    requires:['editor', '../flash/dialog', '../menubutton/']
});
