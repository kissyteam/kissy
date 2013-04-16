/**
 * image dialog (support upload and remote)
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/image/dialog", function (S, IO, Editor, Dialog4E, Tabs, MenuButton) {
    var dtd = Editor.XHTML_DTD,
        UA = S.UA,
        Node = KISSY.NodeList,
        HTTP_TIP = "http://",
        AUTOMATIC_TIP = "自动",
        MARGIN_DEFAULT = 10,
        IMAGE_DIALOG_BODY_HTML = "<div class='{prefixCls}img-tabs'>" +
            "<div class='{prefixCls}img-tabs-bar ks-clear'>" +
            "<div " +
            "class='{prefixCls}img-tabs-tab-selected {prefixCls}img-tabs-tab' " +
            "" +
            "hide" +
            "focus" +
            "='hide" +
            "focus'>" +
            "网络图片" +
            "</div>" +
            "<div " +
            "class='{prefixCls}img-tabs-tab' " +
            "hide" +
            "focus" +
            "='hide" +
            "focus'>" +
            "本地上传" +
            "</div>" +
            "</div>" +
            "<div class='{prefixCls}img-tabs-body' " +
            ">" +
            "<div class='{prefixCls}img-tabs-panel {prefixCls}img-tabs-panel-selected'>" +
            "<label>" +
            "<span " +
            "class='{prefixCls}image-title'" +
            ">" +
            "图片地址： " +
            "</span>" +
            "<input " +
            " data-verify='^(https?:/)?/[^\\s]+$' " +
            " data-warning='网址格式为：http:// 或 /' " +
            "class='{prefixCls}img-url {prefixCls}input' " +
            "style='width:390px;vertical-align:middle;' " +
            "/>" +
            "</label>" +
            "</div>" +
            "<div class='{prefixCls}img-tabs-panel'>" +
            "<form class='{prefixCls}img-upload-form' enctype='multipart/form-data'>" +
            "<p style='zoom:1;'>" +
            "<input class='{prefixCls}input {prefixCls}img-local-url' " +
            "readonly='readonly' " +
            "style='margin-right: 15px; " +
            "vertical-align: middle; " +
            "width: 368px;" +
            "color:#969696;'/>" +
            "<a " +
            "style='padding:3px 11px;" +
            "position:absolute;" +
            "left:390px;" +
            "top:0px;" +
            "z-index:1;' " +
            "class='{prefixCls}image-up {prefixCls}button ks-inline-block'>浏览...</a>" +
            "</p>" +
            "<div class='{prefixCls}img-up-extraHTML'>" +
            "</div>" +
            "</form>" +
            "</div>" +
            "</div>" +
            "</div>" +
            "<div style='" +
            "padding:0 20px 5px 20px;'>" +
            "<table " +
            "style='width:100%;margin-top:8px;' " +
            "class='{prefixCls}img-setting'>" +
            "<tr>" +
            "<td>" +
            "<label>" +
            "宽度： " +
            "</label>" +
            "<input " +
            " data-verify='^(" + AUTOMATIC_TIP + "|((?!0$)\\d+))?$' " +
            " data-warning='宽度请输入正整数' " +
            "class='{prefixCls}img-width {prefixCls}input' " +
            "style='vertical-align:middle;width:60px' " +
            "/> 像素 " +

            "</td>" +
            "<td>" +
            "<label>" +
            "高度： " +
            "<label>" +
            "<input " +
            " data-verify='^(" + AUTOMATIC_TIP + "|((?!0$)\\d+))?$' " +
            " data-warning='高度请输入正整数' " +
            "class='{prefixCls}img-height {prefixCls}input' " +
            "style='vertical-align:middle;width:60px' " +
            "/> 像素 </label>" +

            "<input " +
            "type='checkbox' " +
            "class='{prefixCls}img-ratio' " +
            "style='vertical-align:middle;" +
            "margin-left:5px;" +
            "' " +
            "checked='checked'/>" +
            " 锁定高宽比" +
            "</label>" +
            "</td>" +
            "</tr>" +
            "<tr>" +
            "<td>" +
            "<label>" +
            "对齐： " +
            "</label>" +
            "<select class='{prefixCls}img-align' title='对齐'>" +
            "<option value='none'>无</option>" +
            "<option value='left'>左对齐</option>" +
            "<option value='right'>右对齐</option>" +
            "</select>" +

            "</td>" +
            "<td><label>" +
            "间距： " +
            "</label>" +
            "<input " +
            "" +
            " data-verify='^\\d+$' " +
            " data-warning='间距请输入非负整数' " +
            "class='{prefixCls}img-margin {prefixCls}input' style='width:60px'/> 像素" +

            "</td>" +
            "</tr>" +
            "<tr>" +
            "<td colspan='2' style='padding-top: 6px'>" +
            "<label>" +
            "链接网址： " +
            "</label>" +
            "<input " +
            "class='{prefixCls}img-link {prefixCls}input' " +
            "style='width:235px;vertical-align:middle;' " +
            " data-verify='^(?:(?:\\s*)|(?:https?://[^\\s]+)|(?:#.+))$' " +
            " data-warning='请输入合适的网址格式' " +
            "/>" +

            "<label>" +
            "<input " +
            "class='{prefixCls}img-link-blank' " +
            "style='vertical-align:middle;" +
            "margin-left:5px;" +
            "' " +
            "type='checkbox'/>" +
            " &nbsp; 在新窗口打开链接" +
            "</label>" +
            "</td>" +
            "</tr>" +
            "</table>" +
            "</div>" +
            "</div>",

        IMAGE_DIALOG_FOOT_HTML = "<div style='padding:5px 20px 20px;'>" +
            "<a " +
            "href='javascript:void(\'确定\')' " +
            "class='{prefixCls}img-insert {prefixCls}button ks-inline-block' " +
            "style='margin-right:30px;'>确定</a> " +
            "<a  " +
            "href='javascript:void(\'取消\')' " +
            "class='{prefixCls}img-cancel {prefixCls}button ks-inline-block'>取消</a></div>",

        warning = "请点击浏览上传图片",

        valInput = Editor.Utils.valInput;

    function findAWithImg(img) {
        var ret = img;
        while (ret) {
            var name = ret.nodeName();
            if (name == "a") {
                return ret;
            }
            if (dtd.$block[name] || dtd.$blockLimit[name]) {
                return null;
            }
            ret = ret.parent();
        }
        return null;
    }


    function ImageDialog(editor, config) {
        var self = this;
        self.editor = editor;
        self.imageCfg = config || {};
        self.cfg = self.imageCfg["upload"] || null;
        self.suffix = self.cfg && self.cfg["suffix"] || "png,jpg,jpeg,gif";
        // 不要加g：http://yiminghe.javaeye.com/blog/581347
        self.suffix_reg = new RegExp(self.suffix.split(/,/).join("|") + "$", "i");
        self.suffix_warning = "只允许后缀名为" + self.suffix + "的图片";
    }

    S.augment(ImageDialog, {
        _prepare: function () {
            var self = this;
            var editor = self.editor,
                prefixCls = editor.get('prefixCls') + 'editor-';
            self.dialog = self.d = new Dialog4E({
                width: 500,
                headerContent: "图片",
                bodyContent: S.substitute(IMAGE_DIALOG_BODY_HTML, {
                    prefixCls: prefixCls
                }),
                footerContent: S.substitute(IMAGE_DIALOG_FOOT_HTML, {
                    prefixCls: prefixCls
                }),
                mask: true
            }).render();

            var content = self.d.get("el"),
                cancel = content.one("." + prefixCls + "img-cancel"),
                ok = content.one("." + prefixCls + "img-insert"),
                verifyInputs = Editor.Utils.verifyInputs,
                commonSettingTable = content.one("." + prefixCls + "img-setting");
            self.uploadForm = content.one("." + prefixCls + "img-upload-form");
            self.imgLocalUrl = content.one("." + prefixCls + "img-local-url");
            self.tab = new Tabs({
                "srcNode": self.d.get("body").one('.' + prefixCls + 'img-tabs'),
                prefixCls: prefixCls + 'img-'
            }).render();
            self.imgLocalUrl.val(warning);
            self.imgUrl = content.one("." + prefixCls + "img-url");
            self.imgHeight = content.one("." + prefixCls + "img-height");
            self.imgWidth = content.one("." + prefixCls + "img-width");
            self.imgRatio = content.one("." + prefixCls + "img-ratio");
            self.imgAlign = MenuButton.Select.decorate(content.one("." + prefixCls + "img-align"), {
                prefixCls: prefixCls + 'big-',
                width: 80,
                menuCfg: {
                    prefixCls: prefixCls + '',
                    render: content
                }
            });
            self.imgMargin = content.one("." + prefixCls + "img-margin");
            self.imgLink = content.one("." + prefixCls + "img-link");
            self.imgLinkBlank = content.one("." + prefixCls + "img-link-blank");
            var placeholder = Editor.Utils.placeholder;
            placeholder(self.imgUrl, HTTP_TIP);
            placeholder(self.imgHeight, AUTOMATIC_TIP);
            placeholder(self.imgWidth, AUTOMATIC_TIP);
            placeholder(self.imgLink, "http://");

            self.imgHeight.on("keyup", function () {
                var v = parseInt(valInput(self.imgHeight));
                if (!v || !self.imgRatio[0].checked ||
                    self.imgRatio[0].disabled || !self.imgRatioValue) {
                    return;
                }
                valInput(self.imgWidth, Math.floor(v * self.imgRatioValue));
            });

            self.imgWidth.on("keyup", function () {
                var v = parseInt(valInput(self.imgWidth));
                if (!v || !self.imgRatio[0].checked ||
                    self.imgRatio[0].disabled || !self.imgRatioValue) {
                    return;
                }
                valInput(self.imgHeight, Math.floor(v / self.imgRatioValue));
            });

            cancel.on("click", function (ev) {
                self.d.hide();
                ev.halt();
            });

            var loadingCancel = new Node("<a class='" + prefixCls + "button ks-inline-block' " +
                "style='position:absolute;" +
                "z-index:" +
                Editor.baseZIndex(Editor.zIndexManager.LOADING_CANCEL) + ";" +
                "left:-9999px;" +
                "top:-9999px;" +
                "'>取消上传</a>").appendTo(document.body, undefined);

            self.loadingCancel = loadingCancel;

            function getFileSize(file) {
                if (file['files']) {
                    return file['files'][0].size;
                } else if (1 > 2) {
                    //ie 会安全警告
                    try {
                        var fso = new ActiveXObject("Scripting.FileSystemObject"),
                            file2 = fso['GetFile'](file.value);
                        return file2.size;
                    } catch (e) {
                        S.log(e.message);
                    }
                }
                return 0;
            }

            ok.on("click", function (ev) {
                ev.halt();
                if ((self.imageCfg['remote'] === false ||
                    S.indexOf(self.tab.getSelectedTab(), self.tab.getTabs()) == 1) &&
                    self.cfg) {

                    if (!verifyInputs(commonSettingTable.all("input"))) {
                        return;
                    }

                    if (self.imgLocalUrl.val() == warning) {
                        alert("请先选择文件!");
                        return;
                    }

                    if (!self.suffix_reg.test(self.imgLocalUrl.val())) {
                        alert(self.suffix_warning);
                        // 清除已选文件 ie 不能使用 val("")
                        self.uploadForm[0].reset();
                        self.imgLocalUrl.val(warning);
                        return;
                    }

                    var size = (getFileSize(self.fileInput[0]));

                    if (sizeLimit && sizeLimit < (size / 1000)) {
                        alert("上传图片最大：" + sizeLimit / 1000 + "M");
                        return;
                    }

                    self.d.loading();

                    /**
                     * 取消当前iframe的上传
                     */
                    loadingCancel.on("click", function (ev) {
                        ev.halt();
                        uploadIO.abort();
                    });

                    var serverParams = Editor.Utils.normParams(self.cfg['serverParams']) || {};

                    // 后端返回设置 domain 的 script，每次都传，防止 domain 中途变化
                    serverParams['document-domain'] = document.domain;

                    var uploadIO = IO({
                        data: serverParams,
                        url: self.cfg['serverUrl'],
                        form: self.uploadForm[0],
                        dataType: 'json',
                        type: 'post',
                        complete: function (data, status) {
                            loadingCancel.css({
                                left: -9999,
                                top: -9999
                            });
                            self.d.unloading();
                            if (status == "abort") {
                                return;
                            }
                            if (!data) {
                                data = {error: "服务器出错，请重试"};
                            }
                            if (data.error) {
                                alert(data.error);
                                return;
                            }
                            valInput(self.imgUrl, data['imgUrl']);
                            // chrome 中空 iframe 的 img 请求 header 中没有 refer
                            // 在主页面先请求一次，带入 header
                            new Image().src = data['imgUrl'];
                            self._insert();
                        }
                    });

                    var loadingMaskEl = self.d.get("el"),
                        offset = loadingMaskEl.offset(),
                        width = loadingMaskEl[0].offsetWidth,
                        height = loadingMaskEl[0].offsetHeight;

                    loadingCancel.css({
                        left: (offset.left + width / 2.5),
                        top: (offset.top + height / 1.5)
                    });

                } else {
                    if (!verifyInputs(content.all("input")))
                        return;
                    self._insert();
                }
            });

            if (self.cfg) {
                if (self.cfg['extraHTML']) {
                    content.one("." + prefixCls + "img-up-extraHTML")
                        .html(self.cfg['extraHTML']);
                }
                var ke_image_up = content.one("." + prefixCls + "image-up"),
                    sizeLimit = self.cfg && self.cfg['sizeLimit'];

                self.fileInput = new Node("<input " +
                    "type='file' " +
                    "style='position:absolute;" +
                    "cursor:pointer;" +
                    "left:" +
                    (UA['ie'] ? "360" : (UA["chrome"] ? "319" : "369")) +
                    "px;" +
                    "z-index:2;" +
                    "top:0px;" +
                    "height:26px;' " +
                    "size='1' " +
                    "name='" + (self.cfg['fileInput'] || "Filedata") + "'/>")
                    .insertAfter(self.imgLocalUrl);
                if (sizeLimit)
                    warning = "单张图片容量不超过 " + (sizeLimit / 1000) + " M";
                self.imgLocalUrl.val(warning);
                self.fileInput.css("opacity", 0);
                self.fileInput.on("mouseenter", function () {
                    ke_image_up.addClass("" + prefixCls + "button-hover");
                });
                self.fileInput.on("mouseleave", function () {
                    ke_image_up.removeClass("" + prefixCls + "button-hover");
                });
                self.fileInput.on("change", function () {
                    var file = self.fileInput.val();
                    //去除路径
                    self.imgLocalUrl.val(file.replace(/.+[\/\\]/, ""));
                });

                if (self.imageCfg['remote'] === false) {
                    self.tab.removeItemAt(0, 1);
                }
            }
            else {
                self.tab.removeItemAt(1, 1);
            }

            self._prepare = S.noop;
        },

        _insert: function () {
            var self = this,
                url = valInput(self.imgUrl),
                img,
                height = parseInt(valInput(self.imgHeight)),
                width = parseInt(valInput(self.imgWidth)),
                align = self.imgAlign.get("value"),
                margin = parseInt(self.imgMargin.val()),
                style = '';

            if (height) {
                style += "height:" + height + "px;";
            }
            if (width) {
                style += "width:" + width + "px;";
            }
            if (align != 'none') {
                style += "float:" + align + ";";
            }
            if (!isNaN(margin) && margin != 0) {
                style += "margin:" + margin + "px;";
            }

            self.d.hide();

            /**
             * 2011-01-05
             * <a><img></a> 这种结构，a不要设成 position:absolute
             * 否则img select 不到？!!: editor.getSelection().selectElement(img) 选择不到
             */
            if (self.selectedEl) {
                img = self.selectedEl;
                self.editor.execCommand("save");
                self.selectedEl.attr({
                    "src": url,
                    //注意设置，取的话要从 _ke_saved_src 里取
                    "_ke_saved_src": url,
                    "style": style
                });
            } else {
                img = new Node("<img " +
                    (style ? ("style='" +
                        style +
                        "'") : "") +
                    " src='" +
                    url +
                    "' " +
                    "_ke_saved_src='" +
                    url +
                    "' alt='' />", null, self.editor.get("document")[0]);
                self.editor.insertElement(img);
            }

            // need a breath for firefox
            // else insertElement(img); img[0].parentNode==null
            setTimeout(function () {
                var link = findAWithImg(img),
                    linkVal = S.trim(valInput(self.imgLink)),
                    sel = self.editor.getSelection(),
                    target = self.imgLinkBlank.attr("checked") ? "_blank" : "_self",
                    linkTarget,
                    skip = 0,
                    prev,
                    next,
                    bs;

                if (link) {
                    linkTarget = link.attr('target') || "_self";
                    if (linkVal != link.attr('href') || linkTarget != target) {
                        img._4e_breakParent(link);
                        if ((prev = img.prev()) && (prev.nodeName() == 'a') && !(prev[0].childNodes.length)) {
                            prev.remove();
                        }

                        if ((next = img.next()) && (next.nodeName() == 'a') && !(next[0].childNodes.length)) {
                            next.remove();
                        }
                    } else {
                        skip = 1;
                    }
                }

                if (!skip && linkVal) {
                    // 新增需要 bookmark，标记
                    if (!self.selectedEl) {
                        bs = sel.createBookmarks();
                    }
                    link = new Node("<a></a>");
                    link.attr("_ke_saved_href", linkVal)
                        .attr("href", linkVal)
                        .attr("target", target);
                    var t = img[0];
                    t.parentNode.replaceChild(link[0], t);
                    link.append(t);
                }

                if (bs) {
                    sel.selectBookmarks(bs);
                }
                else if (self.selectedEl) {
                    self.editor.getSelection().selectElement(self.selectedEl);
                }
                if (!skip) {
                    self.editor.execCommand("save");
                }
            }, 100);
        },

        _update: function (selectedEl) {
            var self = this,
                active = 0,
                link,
                resetInput = Editor.Utils.resetInput;
            self.selectedEl = selectedEl;
            if (selectedEl && self.imageCfg['remote'] !== false) {
                valInput(self.imgUrl, selectedEl.attr("src"));
                var w = parseInt(selectedEl.style("width")),
                    h = parseInt(selectedEl.style("height"));
                if (h) {
                    valInput(self.imgHeight, h);
                } else {
                    resetInput(self.imgHeight);
                }
                if (w) {
                    valInput(self.imgWidth, w);
                } else {
                    resetInput(self.imgWidth);
                }
                self.imgAlign.set("value", selectedEl.style("float") || "none");
                var margin = parseInt(selectedEl.style("margin"))
                    || 0;
                self.imgMargin.val(margin);
                self.imgRatio[0].disabled = false;
                self.imgRatioValue = w / h;
                link = findAWithImg(selectedEl);
            } else {
                var editor = self.editor;
                var inElement = editor.getSelection().getCommonAncestor();
                if (inElement) {
                    link = findAWithImg(inElement);
                }
                var defaultMargin = self.imageCfg['defaultMargin'];
                if (defaultMargin == undefined) {
                    defaultMargin = MARGIN_DEFAULT;
                }
                if (self.tab.get('bar').get('children').length == 2) {
                    active = 1;
                }
                self.imgLinkBlank.attr("checked", true);
                resetInput(self.imgUrl);
                resetInput(self.imgLink);
                resetInput(self.imgHeight);
                resetInput(self.imgWidth);
                self.imgAlign.set("value", "none");
                self.imgMargin.val(defaultMargin);
                self.imgRatio[0].disabled = true;
                self.imgRatioValue = null;
            }
            if (link) {
                valInput(self.imgLink, link.attr("_ke_saved_href") || link.attr("href"));
                self.imgLinkBlank.attr("checked", link.attr("target") == "_blank");
            } else {
                resetInput(self.imgLink);
                self.imgLinkBlank.attr("checked", true);
            }
            self.uploadForm[0].reset();
            self.imgLocalUrl.val(warning);
            var tab = self.tab;
            tab.setSelectedTab(tab.getTabAt(active));
        },
        show: function (_selectedEl) {
            var self = this;
            self._prepare();
            self._update(_selectedEl);
            self.d.show();
        },
        destroy: function () {
            var self = this;
            self.d.destroy();
            self.tab.destroy();
            if (self.loadingCancel) {
                self.loadingCancel.remove();
            }
            if (self.imgAlign) {
                self.imgAlign.destroy();
            }
        }
    });

    return ImageDialog;
}, {
    requires: ['io', 'editor', '../dialog', 'tabs', '../menubutton']
});
