/*
Copyright 2012, KISSY UI Library v1.30rc
MIT Licensed
build time: Jul 16 11:07
*/
/**
 * link dialog
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/link/dialog", function (S, Editor, Overlay4E, Utils) {

    var Dialog = Overlay4E.Dialog,
        _ke_saved_href = Utils._ke_saved_href,
        MIDDLE = "vertical-align:middle;",
        bodyHtml = "<div style='padding:20px 20px 0 20px'>" +
            "<p>" +
            "<label>" +
            "链接网址： " +
            "<input " +
            " data-verify='^(https?://[^\\s]+)|(#.+)$' " +
            " data-warning='请输入合适的网址格式' " +
            "class='ks-editor-link-url ks-editor-input' " +
            "style='width:390px;" +
            MIDDLE +
            "'" +
            " />" +
            "</label>" +
            "</p>" +
            "<p " +
            "style='margin: 15px 0 10px 0px;'>" +
            "<label>" +
            "链接名称： " +
            "<input class='ks-editor-link-title ks-editor-input' style='width:100px;" +
            MIDDLE + "'>" +
            "</label> " +
            "<label>" +
            "<input " +
            "class='ks-editor-link-blank' " +
            "style='vertical-align: middle; margin-left: 21px;' " +
            "type='checkbox'/>" +
            " &nbsp; 在新窗口打开链接" +
            "</label>" +
            "</p>" +
            "</div>",
        footHtml = "<div style='padding:5px 20px 20px;'>" +
            "<a " +
            "href='javascript:void(\'确定\')' " +
            "class='ks-editor-link-ok ks-editor-button ks-inline-block' " +
            "style='margin-left:65px;margin-right:20px;'>确定</a> " +
            "<a " +
            "href='javascript:void(\'取消\')' " +
            "class='ks-editor-link-cancel ks-editor-button ks-inline-block'>取消</a>" +
            "</div>";

    function LinkDialog(editor,config) {
        var self = this;
        self.editor = editor;
        self.config=config||{};
        Editor.Utils.lazyRun(self, "_prepareShow", "_real");
    }

    S.augment(LinkDialog, {
        _prepareShow:function () {
            var self = this,
                d = new Dialog({
                    autoRender:true,
                    width:500,
                    headerContent:"链接",
                    bodyContent:bodyHtml,
                    footerContent:footHtml,
                    mask:true
                });
            self.dialog = d;
            var body = d.get("body"),
                foot = d.get("footer");
            d.urlEl = body.one(".ks-editor-link-url");
            d.urlTitle = body.one(".ks-editor-link-title");
            d.targetEl = body.one(".ks-editor-link-blank");
            var cancel = foot.one(".ks-editor-link-cancel"),
                ok = foot.one(".ks-editor-link-ok");
            ok.on("click", self._link, self);
            cancel.on("click", function (ev) {
                ev && ev.halt();
                d.hide();
            });
            Editor.Utils.placeholder(d.urlEl, "http://");
        },

        _link:function (ev) {
            ev.halt();
            var self = this,
                d = self.dialog,
                url = d.urlEl.val();
            if (!Editor.Utils.verifyInputs(d.get("el").all("input"))) {
                return;
            }
            d.hide();
            var attr = {
                href:url,
                target:d.targetEl[0].checked ? "_blank" : "_self",
                title:S.trim(d.urlTitle.val())
            };
            // ie9 focus 不同步，hide后等会才能恢复焦点
            setTimeout(function () {
                Utils.applyLink(self.editor, attr, self._selectedEl);
            }, 0);
        },

        _real:function () {
            var self = this,
                cfg = self.config,
                d = self.dialog,
                _selectedEl = self._selectedEl;
            //是修改行为
            if (_selectedEl) {
                var url = _selectedEl.attr(_ke_saved_href) || _selectedEl.attr("href");
                Editor.Utils.valInput(d.urlEl, url);
                d.urlTitle.val(_selectedEl.attr("title") || "");
                d.targetEl[0].checked = (_selectedEl.attr("target") == "_blank");
            } else {
                Editor.Utils.resetInput(d.urlEl);
                d.urlTitle.val("");
                if (cfg.target) {
                    d.targetEl[0].checked = true;
                }
            }
            d.show();
        },
        show:function (_selectedEl) {
            var self = this;
            self._selectedEl = _selectedEl;
            self._prepareShow();
        }
    });
    return LinkDialog;
}, {
    requires:['editor', '../overlay/', './utils']
});
