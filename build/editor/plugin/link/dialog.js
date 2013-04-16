/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:18
*/
/**
 * link dialog
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/link/dialog", function (S, Editor, Dialog4E, Utils) {

    var _ke_saved_href = Utils._ke_saved_href,
        bodyHTML = "<div style='padding:20px 20px 0 20px'>" +
            "<p>" +
            "<label>" +
            "链接网址： " +
            "<input " +
            " data-verify='^(https?://[^\\s]+)|(#.+)$' " +
            " data-warning='请输入合适的网址格式' " +
            "class='{prefixCls}editor-link-url {prefixCls}editor-input' " +
            "style='width:390px;" +
            "'" +
            " />" +
            "</label>" +
            "</p>" +
            "<p " +
            "style='margin: 15px 0 10px 0px;'>" +
            "<label>" +
            "链接名称： " +
            "<input class='{prefixCls}editor-link-title {prefixCls}editor-input' style='width:100px;" +
            "'>" +
            "</label> " +
            "<label>" +
            "<input " +
            "class='{prefixCls}editor-link-blank' " +
            "style='vertical-align: middle; margin-left: 21px;' " +
            "type='checkbox'/>" +
            " &nbsp; 在新窗口打开链接" +
            "</label>" +
            "</p>" +
            "</div>",
        footHTML = "<div style='padding:5px 20px 20px;'>" +
            "<a " +
            "href='javascript:void(\'确定\')' " +
            "class='{prefixCls}editor-link-ok {prefixCls}editor-button ks-inline-block' " +
            "style='margin-left:65px;margin-right:20px;'>确定</a> " +
            "<a " +
            "href='javascript:void(\'取消\')' " +
            "class='{prefixCls}editor-link-cancel {prefixCls}editor-button ks-inline-block'>取消</a>" +
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
                editor=self.editor,
                prefixCls=editor.get('prefixCls'),
                d = new Dialog4E({
                    width:500,
                    headerContent:"链接",
                    bodyContent: S.substitute(bodyHTML,{
                        prefixCls:prefixCls
                        }),
                    footerContent:S.substitute(footHTML,{
                        prefixCls:prefixCls
                    }),
                    mask:true
                }).render();
            self.dialog = d;
            var body = d.get("body"),
                foot = d.get("footer");
            d.urlEl = body.one("."+prefixCls+"editor-link-url");
            d.urlTitle = body.one("."+prefixCls+"editor-link-title");
            d.targetEl = body.one("."+prefixCls+"editor-link-blank");
            var cancel = foot.one("."+prefixCls+"editor-link-cancel"),
                ok = foot.one("."+prefixCls+"editor-link-ok");
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
    requires:['editor', '../dialog', './utils']
});
