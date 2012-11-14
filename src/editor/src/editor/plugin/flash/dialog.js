/**
 * flash dialog
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/flash/dialog", function (S, Editor, flashUtils, Overlay4E, MenuButton) {
    var CLS_FLASH = 'ke_flash',
        TYPE_FLASH = 'flash',
        Dialog = Overlay4E.Dialog,
        TIP = "请输入如 http://www.xxx.com/xxx.swf",
        bodyHtml = "<div style='padding:20px 20px 0 20px'>" +
            "<p>" +
            "<label>网址： " +
            "<input " +
            " data-verify='^https?://[^\\s]+$' " +
            " data-warning='网址格式为：http://' " +
            "class='{prefixCls}editor-flash-url {prefixCls}editor-input' style='width:300px;" +
            "' />" +
            "</label>" +
            "</p>" +
            "<table style='margin:10px 0 5px  40px;width:300px;'>" +
            "<tr>" +
            "<td>" +
            "<label>宽度： " +
            "<input " +
            " data-verify='^(?!0$)\\d+$' " +
            " data-warning='宽度请输入正整数' " +
            "class='{prefixCls}editor-flash-width {prefixCls}editor-input' style='width:60px;" +
            "' /> 像素 </label>" +
            "</td>" +
            "<td>" +
            "<label>高度： " +
            "<input " +
            " data-verify='^(?!0$)\\d+$' " +
            " data-warning='高度请输入正整数' " +
            "class='{prefixCls}editor-flash-height {prefixCls}editor-input' " +
            "style='width:60px;" +
            "' /> 像素 " +
            "</label>" +
            "</td>" +
            "</tr>" +
            "<tr>" +
            "<td>" +
            "<label>" +
            "对齐： " +
            "</label>" +
            "<select class='{prefixCls}editor-flash-align' title='对齐'>" +
            "<option value='none'>无</option>" +
            "<option value='left'>左对齐</option>" +
            "<option value='right'>右对齐</option>" +
            "</select>" +
            "</td>" +
            "<td>" +
            "<label>间距： " +
            "</label>" +
            "<input " +
            " data-verify='^\\d+$' " +
            " data-warning='间距请输入非负整数' "
            + "class='{prefixCls}editor-flash-margin {prefixCls}editor-input' " +
            "style='width:60px;" +
            "' value='"
            + 5 + "'/> 像素" +
            "</td></tr>" +
            "</table>" +
            "</div>",
        footHtml = "<div style='padding:10px 0 35px 20px;'>" +
            "<a " +
            "class='{prefixCls}editor-flash-ok {prefixCls}editor-button ks-inline-block' " +
            "style='margin-left:40px;margin-right:20px;'>确定</a> " +
            "<a class='{prefixCls}editor-flash-cancel {prefixCls}editor-button ks-inline-block'>取消</a></div>";


    function FlashDialog(editor, config) {
        var self = this;
        self.editor = editor;
        self.config = config || {};
        Editor.Utils.lazyRun(self, "_prepareShow", "_realShow");
        self._config();
    }

    S.augment(FlashDialog, {
        addRes: Editor.Utils.addRes,
        destroyRes: Editor.Utils.destroyRes,
        _config: function () {
            var self = this,
                editor = self.editor,
                prefixCls = editor.get('prefixCls');
            self._urlTip = TIP;
            self._type = TYPE_FLASH;
            self._cls = CLS_FLASH;
            self._config_dwidth = "400px";
            self._title = "Flash";//属性";
            self._bodyHtml = S.substitute(bodyHtml, {
                prefixCls: prefixCls
            });
            self._footHtml = S.substitute(footHtml, {
                prefixCls: prefixCls
            });
        },
        //建立弹出窗口
        _prepareShow: function () {
            var self = this;
            self.dialog = new Dialog({
                headerContent: self._title,
                bodyContent: self._bodyHtml,
                footerContent: self._footHtml,
                width: self._config_dwidth || "500px",
                mask: true
            }).render();
            self.addRes(self.dialog);
            self._initD();
        },
        _realShow: function () {
            //显示前就要内容搞好
            this._updateD();
            this.dialog.show();
        },
        /**
         * 子类覆盖，如何从flash url得到合适的应用表示地址
         *
         * @param r flash 元素
         */
        _getFlashUrl: function (r) {
            return flashUtils.getUrl(r);
        },
        /**
         * 触发前初始化窗口 field，子类覆盖
         *
         */
        _updateD: function () {
            var self = this,
                editor = self.editor,
                cfg = self.config,
                f = self.selectedFlash;
            if (f) {
                var r = editor.restoreRealElement(f);
                if (!r) {
                    return;
                }
                if (f.css("width")) {
                    self.dWidth.val(parseInt(f.css("width")));
                }
                if (f.css("height")) {
                    self.dHeight.val(parseInt(f.css("height")));
                }
                self.dAlign.set("value", f.css("float"));
                Editor.Utils.valInput(self.dUrl, self._getFlashUrl(r));
                self.dMargin.val(parseInt(r.style("margin")) || 0);
            } else {
                Editor.Utils.resetInput(self.dUrl);
                self.dWidth.val(cfg['defaultWidth'] || "");
                self.dHeight.val(cfg['defaultHeight'] || "");
                self.dAlign.set("value", "none");
                self.dMargin.val("5");
            }
        },
        show: function (_selectedEl) {
            var self = this;
            self.selectedFlash = _selectedEl;
            self._prepareShow();
        },


        /**
         * 映射窗口field，子类覆盖
         *
         */
        _initD: function () {
            var self = this,
                d = self.dialog,
                editor = self.editor,
                prefixCls = editor.get('prefixCls'),
                el = d.get("el");
            self.dHeight = el.one("." + prefixCls + "editor-flash-height");
            self.dWidth = el.one("." + prefixCls + "editor-flash-width");
            self.dUrl = el.one("." + prefixCls + "editor-flash-url");
            self.dAlign = MenuButton.Select.decorate(el.one("." + prefixCls +
                "editor-flash-align"), {
                prefixCls: prefixCls + 'editor-big-',
                width: 80,
                menuCfg: {
                    prefixCls: prefixCls + 'editor-',
                    render: el
                }
            });
            self.dMargin = el.one("." + prefixCls + "editor-flash-margin");
            var action = el.one("." + prefixCls + "editor-flash-ok"),
                cancel = el.one("." + prefixCls + "editor-flash-cancel");
            action.on("click", self._gen, self);
            cancel.on("click", function (ev) {
                d.hide();
                ev && ev.halt();
            });

            Editor.Utils.placeholder(self.dUrl, self._urlTip);
            self.addRes(self.dAlign);
        },

        /**
         * 应用子类覆盖，提供 flash 元素的相关信息
         *
         */
        _getDInfo: function () {
            var self = this;
            return {
                url: self.dUrl.val(),
                attrs: {
                    width: self.dWidth.val(),
                    height: self.dHeight.val(),
                    style: "margin:" +
                        (parseInt(self.dMargin.val()) || 0) +
                        "px;" +
                        "float:" + self.dAlign.get("value") + ";"
                }
            };
        },

        /**
         * 真正产生 flash 元素
         */
        _gen: function (ev) {
            ev && ev.halt();
            var self = this,
                editor = self.editor,
                dinfo = self._getDInfo(),
                url = dinfo && S.trim(dinfo.url),
                attrs = dinfo && dinfo.attrs;
            if (!dinfo) {
                return;
            }
            var re = Editor.Utils.verifyInputs(self.dialog.get("el").all("input"));
            if (!re) {
                return;
            }
            self.dialog.hide();
            var substitute = flashUtils.insertFlash(editor, url, attrs, self._cls, self._type);
            //如果是修改，就再选中
            if (self.selectedFlash) {
                editor.getSelection()
                    .selectElement(substitute);
            }
            editor.notifySelectionChange();
        },

        destroy: function () {
            this.destroyRes();
        }
    });

    return FlashDialog;
}, {
    requires: ['editor', '../flash-common/utils', '../overlay/', '../menubutton/']
});