/**
 * flash dialog
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("flash/dialog/support", function() {
    var S = KISSY,
        KE = S.Editor,
        CLS_FLASH = 'ke_flash',
        TYPE_FLASH = 'flash',
        Dialog = KE.Dialog,
        flashUtils = KE.Utils.flash,
        TIP = "请输入如 http://www.xxx.com/xxx.swf";
    var MIDDLE = "vertical-align:middle";
    var bodyHtml = "<div style='padding:20px 20px 0 20px'>" +
        "<p>" +
        "<label>网址： " +
        "<input " +
        " data-verify='^https?://[^\\s]+$' " +
        " data-warning='网址格式为：http://' " +
        "class='ke-flash-url ke-input' style='width:300px;" +
        MIDDLE + "' />" +
        "</label>" +
        "</p>" +
        "<table style='margin:10px 0 5px  40px;width:300px;'>" +
        "<tr>" +
        "<td>" +
        "<label>宽度： " +
        "<input " +
        " data-verify='^(?!0$)\\d+$' " +
        " data-warning='宽度请输入正整数' " +
        "class='ke-flash-width ke-input' style='width:60px;" +
        "margin-left:2px;" +
        MIDDLE + "' /> 像素 </label>" +
        "</td>" +
        "<td>" +
        "<label>高度：<input " +
        " data-verify='^(?!0$)\\d+$' " +
        " data-warning='高度请输入正整数' " +
        "class='ke-flash-height ke-input' " +
        "style='width:60px;" +
        MIDDLE + "' /> 像素 </label></td>" +
        "</tr>" +
        "<tr>" +
        "<td>" +
        "<label>对齐： " +
        "<select class='ke-flash-align' title='对齐'>" +
        "<option value='none'>无</option>" +
        "<option value='left'>左对齐</option>" +
        "<option value='right'>右对齐</option>" +
        "</select>" +
        "</td>" +
        "<td>" +
        "<label>间距：" +
        "<input " +
        " data-verify='^\\d+$' " +
        " data-warning='间距请输入非负整数' "
        + "class='ke-flash-margin ke-input' " +
        "style='width:60px;" +
        MIDDLE + "' value='"
        + 5 + "'/> 像素" +
        "</label>" +
        "</td></tr>" +
        "</table>" +
        "</div>",

        footHtml = "<div style='padding:5px 20px 20px;'><a " +
            "class='ke-flash-ok ke-button' " +
            "style='margin-left:40px;margin-right:20px;'>确定</a> " +
            "<a class='ke-flash-cancel ke-button'>取消</a></div>";


    function FlashDialog(editor) {
        var self = this;
        self.editor = editor;
        KE.Utils.lazyRun(self, "_prepareShow", "_realShow");
        self._config();
    }

    KE.Flash.FlashDialog = FlashDialog;

    S.augment(FlashDialog, {
        addRes:KE.Utils.addRes,
        destroyRes:KE.Utils.destroyRes,
        _config:function() {
            var self = this;
            self._urlTip = TIP;
            self._type = TYPE_FLASH;
            self._cls = CLS_FLASH;
            self._config_dwidth = "400px";
            self._title = "Flash";//属性";
            self._bodyHtml = bodyHtml;
            self._footHtml = footHtml;
        },
        //建立弹出窗口
        _prepareShow:function() {
            var self = this;
            self.dialog = new Dialog({
                autoRender:true,
                headerContent:self._title,
                bodyContent:self._bodyHtml,
                footerContent:self._footHtml,
                width:self._config_dwidth || "500px",
                mask:true
            });
            self.addRes(self.dialog);
            self._initD();
        },
        _realShow:function() {
            //显示前就要内容搞好
            this._updateD();
            this.dialog.show();
        },
        /**
         * 子类覆盖，如何从flash url得到合适的应用表示地址
         * @override
         * @param r flash 元素
         */
        _getFlashUrl:function(r) {
            return flashUtils.getUrl(r);
        },
        /**
         * 触发前初始化窗口 field，子类覆盖
         * @override
         */
        _updateD:function() {
            var self = this,
                editor = self.editor,
                cfg = editor.cfg.pluginConfig["flash"] || {},
                f = self.selectedFlash;
            if (f) {
                var r = editor.restoreRealElement(f);
                if (!r) return;
                if (f.css("width")) {
                    self.dWidth.val(parseInt(f.css("width")));
                }
                if (f.css("height")) {
                    self.dHeight.val(parseInt(f.css("height")));
                }
                self.dAlign.val(f.css("float"));
                KE.Utils.valInput(self.dUrl, self._getFlashUrl(r));
                self.dMargin.val(parseInt(r._4e_style("margin")) || 0);
            } else {
                KE.Utils.resetInput(self.dUrl);
                self.dWidth.val(cfg['defaultWidth'] || "");
                self.dHeight.val(cfg['defaultHeight'] || "");
                self.dAlign.val("none");
                self.dMargin.val("5");
            }
        },
        show:function(_selectedEl) {
            var self = this;
            self.selectedFlash = _selectedEl;
            self._prepareShow();
        },


        /**
         * 映射窗口field，子类覆盖
         * @override
         */
        _initD:function() {
            var self = this,
                d = self.dialog,
                el = d.get("el");
            self.dHeight = el.one(".ke-flash-height");
            self.dWidth = el.one(".ke-flash-width");
            self.dUrl = el.one(".ke-flash-url");
            self.dAlign = KE.Select.decorate(el.one(".ke-flash-align"));
            self.dMargin = el.one(".ke-flash-margin");
            var action = el.one(".ke-flash-ok"),
                cancel = el.one(".ke-flash-cancel");
            action.on("click", self._gen, self);
            cancel.on("click", function(ev) {
                d.hide();
                ev && ev.halt();
            });

            KE.Utils.placeholder(self.dUrl, self._urlTip);
            self.addRes(action, cancel, self.dUrl);
        },

        /**
         * 应用子类覆盖，提供 flash 元素的相关信息
         * @override
         */
        _getDInfo:function() {
            var self = this;
            return {
                url:  self.dUrl.val(),
                attrs:{
                    width:self.dWidth.val(),
                    height:self.dHeight.val(),
                    style:"margin:" +
                        (parseInt(self.dMargin.val()) || 0) +
                        "px;" +
                        "float:" + self.dAlign.val() + ";"
                }
            };
        },

        /**
         * 真正产生 flash 元素
         */
        _gen: function(ev) {
            ev && ev.halt();
            //debugger
            var self = this,
                editor = self.editor,
                dinfo = self._getDInfo(),
                url = dinfo && S.trim(dinfo.url),
                attrs = dinfo && dinfo.attrs;
            if (!dinfo) return;
            var re = KE.Utils.verifyInputs(self.dialog.get("el").all("input"));
            if (!re) return;
            self.dialog.hide();
            KE.Flash.Insert(editor, url, attrs, self._cls,
                self._type, function(substitute) {
                    //如果是修改，就再选中
                    if (self.selectedFlash) {
                        editor.getSelection()
                            .selectElement(substitute);
                    }
                    editor.notifySelectionChange();
                });
        },

        destroy:function() {
            this.destroyRes();
        }
    });
}, {
    attach:false
});