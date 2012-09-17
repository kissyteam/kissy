/**
 * image dialog (support upload and remote)
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("image/dialog", function (editor) {
    var S = KISSY,
        KE = S.Editor,
        dtd = KE.XHTML_DTD,
        DOM = S.DOM,
        UA = S.UA,
        JSON = S['JSON'],
        Node = S.Node,
        Event = S.Event,
        TIP = "http://",
        DTIP = "自动",
        MARGIN_DEFAULT = 10,
        bodyHtml = "<div class='ke-image-wrap'>" +
            "<ul class='ke-tabs ks-clear'>" +
            "<li " +
            "rel='remote'>" +
            "网络图片" +
            "</li>" +
            "<li " +
            "rel='local'>" +
            "本地上传" +
            "</li>" +
            "</ul>" +
            "<div style='" +
            "padding:12px 20px 5px 20px;'>" +
            "<div class='ke-image-tabs-content-wrap' " +
            ">" +
            "<div>" +
            "<label>" +
            "<span " +
            "class='ke-image-title'" +
            ">" +
            "图片地址： " +
            "</span>" +
            "<input " +
            " data-verify='^(https?:/)?/[^\\s]+$' " +
            " data-warning='网址格式为：http:// 或 /' " +
            "class='ke-img-url ke-input' " +
            "style='width:390px;vertical-align:middle;' " +
            "/>" +
            "</label>" +
            "</div>" +
            "<div style='position:relative;'>" +
            "<form class='ke-img-upload-form' method='post'>" +
            "<p style='zoom:1;'>" +
            "<input class='ke-input ke-img-local-url' " +
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
            "class='ke-image-up ke-button'>浏览...</a>" +
            "</p>" +
            "<div class='ke-img-up-extraHtml'>" +
            "</div>" +
            "</form>" +
            "</div>" +
            "</div>" +
            "<table " +
            "style='width:100%;margin-top:8px;' " +
            "class='ke-img-setting'>" +
            "<tr>" +
            "<td>" +
            "<label>" +
            "宽度： " +
            "<input " +
            " data-verify='^(" + DTIP + "|((?!0$)\\d+))?$' " +
            " data-warning='宽度请输入正整数' " +
            "class='ke-img-width ke-input' " +
            "style='vertical-align:middle;width:60px' " +
            "/> 像素 </label>" +
            "</td>" +
            "<td>" +
            "<label>" +
            "高度： " +
            "<input " +
            " data-verify='^(" + DTIP + "|((?!0$)\\d+))?$' " +
            " data-warning='高度请输入正整数' " +
            "class='ke-img-height ke-input' " +
            "style='vertical-align:middle;width:60px' " +
            "/> 像素 </label>" +
            "<label>" +
            "<input " +
            "type='checkbox' " +
            "class='ke-img-ratio' " +
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
            "对齐：" +
            "<select class='ke-img-align' title='对齐'>" +
            "<option value='none'>无</option>" +
            "<option value='left'>左对齐</option>" +
            "<option value='right'>右对齐</option>" +
            "</select>" +
            "</label>" +
            "</td>" +
            "<td><label>" +
            "间距： " +
            "<input " +
            "" +
            " data-verify='^\\d+$' " +
            " data-warning='间距请输入非负整数' " +
            "class='ke-img-margin ke-input' style='width:60px'/> 像素" +
            "</label>" +
            "</td>" +
            "</tr>" +
            "<tr class='ke-img-link-row'>" +
            "<td colspan='2' style='padding-top: 6px'>" +
            "<label>" +
            "链接网址： " +
            "<input " +
            "class='ke-img-link ke-input' " +
            "style='width:235px;vertical-align:middle;' " +
            " data-verify='^(?:(?:\\s*)|(?:https?://[^\\s]+)|(?:#.+))$' " +
            " data-warning='请输入合适的网址格式' " +
            "/>" +
            "</label>" +
            "<label>" +
            "<input " +
            "class='ke-img-link-blank' " +
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
        footHtml = "<div style='padding:5px 20px 20px;'>" +
            "<a class='ke-img-insert ke-button' " +
            "style='margin-right:30px;'>确定</a> " +
            "<a  class='ke-img-cancel ke-button'>取消</a></div>",
        d,
        tab,
        imgUrl,
        imgHeight,
        imgWidth,
        imgAlign,
        imgRatio,
        imgMargin,
        imgRatioValue,
        imgLocalUrl,
        imgLink,
        imgLinkBlank,
        fileInput,
        uploadForm,
        warning = "请点击浏览上传图片",
        selectedEl,
        imageCfg = editor.cfg["pluginConfig"]["image"] || {},
        cfg = imageCfg["upload"] || null,
        suffix = cfg && cfg["suffix"] || "png,jpg,jpeg,gif",
    //不要加g：http://yiminghe.javaeye.com/blog/581347
        suffix_reg = new RegExp(suffix.split(/,/).join("|") + "$", "i"),
        suffix_warning = "只允许后缀名为" + suffix + "的图片",
        controls = {},
        addRes = KE.Utils.addRes,
        destroyRes = KE.Utils.destroyRes;

    function findAWithImg(img) {
        var ret = img.parent();
        while (ret) {
            var name = ret._4e_name();
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

    function prepare() {

        d = new KE.Dialog({
            autoRender: true,
            width: 500,
            headerContent: "图片", //属性",
            bodyContent: bodyHtml,
            footerContent: footHtml,
            mask: true
        });
        addRes.call(controls, d);
        var content = d.get("el"),
            cancel = content.one(".ke-img-cancel"),
            ok = content.one(".ke-img-insert"),
            verifyInputs = KE.Utils.verifyInputs,
            commonSettingTable = content.one(".ke-img-setting");
        uploadForm = content.one(".ke-img-upload-form");
        imgLocalUrl = content.one(".ke-img-local-url");
        tab = new KE.Tabs({
            tabs: content.one("ul.ke-tabs"),
            contents: content.one("div.ke-image-tabs-content-wrap")
        });
        addRes.call(controls, tab);
        imgLocalUrl.val(warning);
        imgUrl = content.one(".ke-img-url");
        imgHeight = content.one(".ke-img-height");
        imgWidth = content.one(".ke-img-width");
        imgRatio = content.one(".ke-img-ratio");
        imgAlign = KE.Select.decorate(content.one(".ke-img-align"));
        imgMargin = content.one(".ke-img-margin");
        imgLink = content.one(".ke-img-link");
        imgLinkBlank = content.one(".ke-img-link-blank");
        var placeholder = KE.Utils.placeholder;
        placeholder(imgUrl, TIP);
        placeholder(imgHeight, DTIP);
        placeholder(imgWidth, DTIP);
        placeholder(imgLink, "http://");
        imgHeight.on("keyup", function () {
            var v = parseInt(valInput(imgHeight));
            if (!v ||
                !imgRatio[0].checked ||
                imgRatio[0].disabled ||
                !imgRatioValue) {
                return;
            }
            valInput(imgWidth, Math.floor(v * imgRatioValue));
        });
        addRes.call(controls, imgHeight, imgUrl, imgWidth);

        imgWidth.on("keyup", function () {
            var v = parseInt(valInput(imgWidth));
            if (!v ||
                !imgRatio[0].checked ||
                imgRatio[0].disabled ||
                !imgRatioValue) {
                return;
            }
            valInput(imgHeight, Math.floor(v / imgRatioValue));
        });
        addRes.call(controls, imgWidth);
        cancel.on("click", function (ev) {
            d.hide();
            ev.halt();
        });
        addRes.call(controls, cancel);
        var loadingCancel = new Node("<a class='ke-button' style='position:absolute;" +
            "z-index:" +
            KE.baseZIndex(KE.zIndexManager.LOADING_CANCEL) + ";" +
            "left:-9999px;" +
            "top:-9999px;" +
            "'>取消上传</a>").appendTo(document.body);

        /**
         * 取消当前iframe的上传
         */
        var uploadIframe = null;
        loadingCancel.on("click", function (ev) {
            ev && ev.halt();
            d.unloading();
            if (uploadIframe) {
                Event.remove(uploadIframe, "load");
                DOM.remove(uploadIframe);
            }
            loadingCancel.css({
                left: -9999,
                top: -9999
            });
            uploadIframe = null;
        });
        addRes.call(controls, loadingCancel);
        function getFileSize(file) {
            if (file['files']) {
                return file['files'][0].size;
            } else if (1 > 2) {
                //ie 会安全警告
                try {
                    var fso = new ActiveXObject("Scripting.FileSystemObject");
                    var file2 = fso['GetFile'](file.value);
                    return file2.size;
                } catch (e) {
                    S.log(e.message);
                }
            }
            return 0;
        }

        ok.on("click", function (ev) {
            ev.halt();
            if (tab.activate() == "local" && cfg) {

                if (!verifyInputs(commonSettingTable.all("input"))) {
                    return;
                }

                if (imgLocalUrl.val() == warning) {
                    alert("请先选择文件!");
                    return;
                }

                if (!suffix_reg.test(imgLocalUrl.val())) {
                    alert(suffix_warning);
                    //清除已选文件， ie 不能使用 val("")
                    uploadForm[0].reset();
                    imgLocalUrl.val(warning);
                    return;
                }

                var size = (getFileSize(fileInput[0]));

                if (sizeLimit && sizeLimit < (size / 1000)) {
                    alert("上传图片最大：" + sizeLimit / 1000 + "M");
                    return;
                }

                d.loading();

                uploadIframe = KE.Utils.doFormUpload({
                    form: uploadForm,
                    callback: function (r) {
                        uploadIframe = null;
                        loadingCancel.css({
                            left: -9999,
                            top: -9999
                        });
                        var data = S.trim(r.responseText)
                            .replace(/\r|\n/g, "");
                        d.unloading();
                        try {
                            //ie parse error,不抛异常
                            data = JSON.parse(data);
                        } catch (e) {
                            S.log(data);
                            data = null;
                        }
                        if (!data) data = {error: "服务器出错，请重试"};
                        if (data.error) {
                            alert(data.error);
                            return;
                        }
                        valInput(imgUrl, data['imgUrl']);
                        // chrome 中空 iframe 的 img 请求 header 中没有 refer
                        // 在主页面先请求一次，带入 header
                        new Image().src = data['imgUrl'];
                        insert();
                    }
                }, cfg['serverParams'], cfg['serverUrl']);

                var loadingMaskEl = d.get("el"),
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
                insert();
            }
        });

        addRes.call(controls, ok);

        if (cfg) {
            if (cfg['extraHtml']) {
                content.one(".ke-img-up-extraHtml")
                    .html(cfg['extraHtml']);
            }
            var ke_image_up = content.one(".ke-image-up"),
                sizeLimit = cfg && cfg['sizeLimit'];

            fileInput = new Node("<input " +
                "type='file' " +
                "style='position:absolute;" +
                "cursor:pointer;" +
                "left:" +
                (UA['ie'] ? "360" : (UA['chrome'] ? "319" : "369")) +
                "px;" +
                "z-index:2;" +
                "top:0px;" +
                "height:26px;' " +
                "size='1' " +
                "name='" + (cfg['fileInput'] || "Filedata") + "'/>")
                .insertAfter(imgLocalUrl);
            if (sizeLimit)
                warning = "单张图片容量不超过 " + (sizeLimit / 1000) + " M";
            imgLocalUrl.val(warning);
            fileInput.css("opacity", 0);
            fileInput.on("mouseenter", function () {
                ke_image_up.addClass("ke-button-hover");
            });
            fileInput.on("mouseleave", function () {
                ke_image_up.removeClass("ke-button-hover");
            });
            fileInput.on("change", function () {
                var file = fileInput.val();
                //去除路径
                imgLocalUrl.val(file.replace(/.+[\/\\]/, ""));
            });
            addRes.call(controls, fileInput);

            if (imageCfg['remote'] === false) {
                tab.remove("remote");
            }
        }
        else {
            tab.remove("local");
        }
    }


    function insert() {
        var url = valInput(imgUrl),
            img,
            height = parseInt(valInput(imgHeight)),
            width = parseInt(valInput(imgWidth)),
            align = imgAlign.val(),
            margin = parseInt(imgMargin.val()),
            style = '';

        if (height) {
            style += "height:" + height + "px;";
        }
        if (width) {
            style += "width:" + width + "px;";
        }
        if (align) {
            style += "float:" + align + ";";
        }
        if (!isNaN(margin)) {
            style += "margin:" + margin + "px;";
        }

        d.hide();

        /**
         * 2011-01-05
         * <a><img></a> 这种结构，a不要设成 position:absolute
         * 否则img select 不到？!!: editor.getSelection().selectElement(img) 选择不到
         */
        if (selectedEl) {
            img = selectedEl;
            editor.fire("save");
            selectedEl.attr({
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
                "' alt='' />", null, editor.document);
//            img.on("abort error load", function() {
//                img.detach();
//                // ie6 手动设置，才会出现红叉
//                img[0].src = url;
//            });
            editor.insertElement(img);
        }

        // need a breath for firefox
        // else insertElement(img); img[0].parentNode==null
        setTimeout(function () {
            var link = findAWithImg(img),
                linkVal = S.trim(valInput(imgLink)),
                sel = editor.getSelection(),
                bs;
            if (link) {
                if (linkVal) {
                    link.attr("_ke_saved_href", linkVal)
                        .attr("href", linkVal)
                        .attr("target", imgLinkBlank.attr("checked") ? "_blank" : "_self");
                    //editor.notifySelectionChange();
                } else {
                    // 删除
                    bs = sel.createBookmarks();
                    link._4e_remove(true);
                }
            } else if (linkVal) {
                // 新增需要 bookmark，标记
                bs = sel.createBookmarks();
                link = new Node("<a></a>");
                link.attr("_ke_saved_href", linkVal)
                    .attr("href", linkVal)
                    .attr("target", imgLinkBlank.attr("checked") ? "_blank" : "_self");
                var t = img[0];
                t.parentNode.replaceChild(link[0], t);
                link.append(t);
            }
            if (bs) {
                sel.selectBookmarks(bs);
            }

            if (selectedEl) {
                editor.fire("save");
            }
        }, 100);
    }

    var valInput = KE.Utils.valInput;

    function update(_selectedEl) {
        var active = "remote",
            resetInput = KE.Utils.resetInput;
        selectedEl = _selectedEl;
        if (selectedEl && imageCfg.remote !== false) {
            valInput(imgUrl, selectedEl.attr("src"));
            var w = parseInt(selectedEl.style("width")),
                h = parseInt(selectedEl.style("height"));
            if (h) {
                valInput(imgHeight, h);
            } else {
                resetInput(imgHeight);
            }
            if (w) {
                valInput(imgWidth, w);
            } else {
                resetInput(imgWidth);
            }
            imgAlign.val(selectedEl.css("float") || "none");
            var margin = parseInt(selectedEl._4e_style("margin"))
                || 0;
            imgMargin.val(margin);
            imgRatio[0].disabled = false;
            imgRatioValue = w / h;
            var link = findAWithImg(selectedEl);
            if (link) {
                valInput(imgLink, link.attr("_ke_saved_href") || link.attr("href"));
                imgLinkBlank.attr("checked", link.attr("target") == "_blank");
            } else {
                resetInput(imgLink);
                imgLinkBlank.attr("checked", true);
            }
        } else {
            var defaultMargin = imageCfg.defaultMargin;
            if (defaultMargin == undefined) {
                defaultMargin = MARGIN_DEFAULT;
            }
            if (tab.getTab("local")) {
                active = "local";
            }
            imgLinkBlank.attr("checked", true);
            resetInput(imgUrl);
            resetInput(imgLink);
            resetInput(imgHeight);
            resetInput(imgWidth);
            imgAlign.val("none");
            imgMargin.val(defaultMargin);
            imgRatio[0].disabled = true;
            imgRatioValue = null;
        }
        uploadForm[0].reset();
        imgLocalUrl.val(warning);
        tab.activate(active);
    }

    KE.use("overlay,tabs,select", function () {
        prepare();
        editor.addDialog("image/dialog", {
            show: function (_selectedEl) {
                update(_selectedEl);
                d.show();
            },
            hide: function () {
                d.hide();
            },
            destroy: function () {
                destroyRes.call(controls);
            },
            dialog: d
        });
    });
}, {
    attach: false
});