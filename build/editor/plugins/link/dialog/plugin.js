/**
 * link dialog
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("link/dialog", function(editor) {

    var S = KISSY,KE = S.Editor;
    KE.namespace("Link");
    var Link = KE['Link'];
    if (!Link.Dialog) {
        (function() {
            var Dialog = KE.Dialog,
                MIDDLE = "vertical-align:middle;",
                bodyHtml = "<div style='padding:20px 20px 0 20px'>" +
                    "<p>" +
                    "<label>" +
                    "链接网址： " +
                    "<input " +
                    " data-verify='^(https?://[^\\s]+)|(#.+)$' " +
                    " data-warning='请输入合适的网址格式' " +
                    "class='ke-link-url ke-input' " +
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
                    "<input class='ke-link-title ke-input' style='width:100px;" +
                    MIDDLE + "'>" +
                    "</label> " +
                    "<label>" +
                    "<input " +
                    "class='ke-link-blank' " +
                    "style='vertical-align: middle; margin-left: 21px;' " +
                    "type='checkbox'/>" +
                    " &nbsp; 在新窗口打开链接" +
                    "</label>" +
                    "</p>" +

                    "</div>",
                footHtml = "<div style='padding:5px 20px 20px;'>" +
                    "<a class='ke-link-ok ke-button' " +
                    "style='margin-left:65px;margin-right:20px;'>确定</a> " +
                    "<a class='ke-link-cancel ke-button'>取消</a>" +
                    "</div>";

            var addRes = KE.Utils.addRes,
                destroyRes = KE.Utils.destroyRes;

            function LinkDialog(editor) {
                var self = this;
                self.editor = editor;
                KE.Utils.lazyRun(self, "_prepareShow", "_real");
            }


            Link.Dialog = LinkDialog;

            S.augment(LinkDialog, {
                _prepareShow:function() {
                    var self = this,
                        d = new Dialog({
                            autoRender:true,
                            width:500,
                            headerContent:"链接",//属性",
                            bodyContent:bodyHtml,
                            footerContent:footHtml,
                            mask:true
                        });
                    self.dialog = d;
                    var body = d.get("body"),
                        foot = d.get("footer");
                    d.urlEl = body.one(".ke-link-url");
                    d.urlTitle = body.one(".ke-link-title");
                    d.targetEl = body.one(".ke-link-blank");
                    var cancel = foot.one(".ke-link-cancel"),
                        ok = foot.one(".ke-link-ok");
                    ok.on("click", self._link, self);
                    cancel.on("click", function(ev) {
                        ev && ev.halt();
                        d.hide();
                    });
                    KE.Utils.placeholder(d.urlEl, "http://");
                    addRes.call(self, ok, cancel, d, d.urlEl);
                },


                _link:function(ev) {
                    ev && ev.halt();
                    var self = this,
                        cmd = self.cmd,
                        d = self.dialog,
                        url = d.urlEl.val();
                    if (!KE.Utils.verifyInputs(d.get("el").all("input"))) {
                        return;
                    }
                    d.hide();
                    var attr = {
                        href:url,
                        target:d.targetEl[0].checked ? "_blank" : "_self",
                        title:S.trim(d.urlTitle.val())
                    };
                    //ie9 focus 不同步，hide后等会才能恢复焦点
                    setTimeout(function() {
                        cmd.call("_link", attr, self._selectedEl);
                    }, 0);
                },



                _real:function() {
                    var self = this,
                        cfg = self.editor.cfg.pluginConfig["link"] || {},
                        cmd = self.cmd,
                        //action = cmd.cfg,
                        link = cmd.call("_getSelectedLink"),
                        url = cmd.call("_getSelectionLinkUrl"),
                        d = self.dialog;
                    self._selectedEl = link;
                    //是修改行为
                    if (link) {
                        KE.Utils.valInput(d.urlEl, url);
                        d.urlTitle.val(link.attr("title") || "");
                        d.targetEl[0].checked = (link.attr("target") == "_blank");
                    } else {
                        KE.Utils.resetInput(d.urlEl);
                        d.urlTitle.val("");
                        if (cfg.target) d.targetEl[0].checked = true;
                    }
                    d.show();
                },
                show:function(cmd) {
                    this.cmd = cmd;
                    this._prepareShow();
                },
                destroy:function() {
                    destroyRes.call(this);
                }
            });
        })();
    }
    editor.addDialog("link/dialog", new Link.Dialog(editor));
}, {
    attach:false
});