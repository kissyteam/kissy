/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:21
*/
/**
 * xiami-music dialog
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/xiami-music/dialog", function (S, Editor, FlashDialog, MenuButton) {
    var DOM = S.DOM,
        Node = S.Node,
        Utils = Editor.Utils,
        loading = Utils.debugUrl("theme/tao-loading.gif"),
        XIAMI_URL = "http://www.xiami.com/app/nineteen/search/key/{key}/page/{page}",
        CLS_XIAMI = "ke_xiami",
        TYPE_XIAMI = "xiami-music",
        BTIP = "搜 索",
        TIP = "输入歌曲名、专辑名、艺人名";


    function limit(str, l) {
        if (str.length > l)
            str = str.substring(0, l) + "...";
        return str;
    }

    var MARGIN_DEFAULT = 0,
        bodyHTML = "<div style='padding:40px 0 70px 0;'>" +
            "<form action='#' class='{prefixCls}editor-xiami-form' style='margin:0 20px;'>" +
            "<p class='{prefixCls}editor-xiami-title'>" +
            "" +
            "</p>" +
            "<p class='{prefixCls}editor-xiami-url-wrap'>" +
            "<input class='{prefixCls}editor-xiami-url {prefixCls}editor-input' " +
            "style='width:370px;"
            + "'" +
            "/> &nbsp; " +
            " <a " +
            "class='{prefixCls}editor-xiami-submit {prefixCls}editor-button ks-inline-block'" +
            ">"
            + BTIP + "</a>" +
            "</p>" +
            "<p " +
            "style='margin:10px 0'>" +
            "<label>对 齐： " +
            "<select " +
            "class='{prefixCls}editor-xiami-align' title='对齐'>" +
            "<option value='none'>无</option>" +
            "<option value='left'>左对齐</option>" +
            "<option value='right'>右对齐</option>" +
            "</select>" +
            "</label>" +
            "<label style='margin-left:70px;'>间距： " +
            " " +
            "<input " +
            "" +
            " data-verify='^\\d+$' " +
            " data-warning='间距请输入非负整数' " +
            "class='{prefixCls}editor-xiami-margin {prefixCls}editor-input' style='width:60px;" +
            "' value='"
            + MARGIN_DEFAULT + "'/> 像素" +
            "</label>" +
            "</p>" +
            "</form>" +
            "<div " +
            "class='{prefixCls}editor-xiami-list'>" +
            "</div>" +
            "</div>",
        footHTML = "<div style='padding:5px 20px 20px;'><a " +
            "class='{prefixCls}editor-xiami-ok {prefixCls}editor-button ks-inline-block' " +
            "style='margin-right:20px;'>确&nbsp;定</a>" +
            "<a class='{prefixCls}editor-xiami-cancel {prefixCls}editor-button ks-inline-block'>取&nbsp;消</a></div>";

    function XiamiMusicDialog() {
        XiamiMusicDialog.superclass.constructor.apply(this, arguments);
    }

    S.extend(XiamiMusicDialog, FlashDialog, {
        _config: function () {
            var self = this,
                editor = self.editor,
                prefixCls = editor.get('prefixCls');
            self._cls = CLS_XIAMI;
            self._type = TYPE_XIAMI;
            self._title = "虾米音乐";//属性";
            self._bodyHTML = S.substitute(bodyHTML, {
                prefixCls: prefixCls
            });
            self._footHTML = S.substitute(footHTML, {
                prefixCls: prefixCls
            });
        },
        _initD: function () {
            var self = this,
                editor = self.editor,
                prefixCls = editor.get('prefixCls'),
                d = self.dialog,
                del = d.get("el"),
                dfoot = d.get("footer"),
                input = del.one("." + prefixCls + "editor-xiami-url");
            self.dAlign = MenuButton.Select.decorate(del.one("." + prefixCls + "editor-xiami-align"), {
                prefixCls: 'ks-editor-big-',
                width: 80,
                menuCfg: {
                    prefixCls: 'ks-editor-',
                    render: del
                }
            });
            self.addRes(self.dAlign);
            self._xiami_input = input;
            Editor.Utils.placeholder(input, TIP);
            self.addRes(input);
            self._xiamia_list = del.one("." + prefixCls + "editor-xiami-list");
            self._xiami_submit = del.one("." + prefixCls + "editor-xiami-submit");
            self._xiami_submit.on("click", function (ev) {
                if (!self._xiami_submit.hasClass("ks-editor-button-disabled", undefined))
                    loadRecordsByPage(1);
                ev.halt();
            });
            self.addRes(self._xiami_submit);
            input.on("keydown", function (ev) {
                if (ev.keyCode === 13) {
                    loadRecordsByPage(1);
                }
            });
            self.dMargin = del.one("." + prefixCls + "editor-xiami-margin");
            self._xiami_url_wrap = del.one("." + prefixCls + "editor-xiami-url-wrap");
            self._xiamia_title = del.one("." + prefixCls + "editor-xiami-title");

            var _xiami_ok = dfoot.one("." + prefixCls + "editor-xiami-ok");
            dfoot.one("." + prefixCls + "editor-xiami-cancel").on("click", function (ev) {
                d.hide();
                ev.halt();
            });
            self.addRes(dfoot);
            _xiami_ok.on("click", function (ev) {
                var f = self.selectedFlash,
                    r = editor.restoreRealElement(f);
                self._dinfo = {
                    url: self._getFlashUrl(r),
                    attrs: {
                        title: f.attr("title"),
                        //align:self.dAlign.val(),
                        style: "margin:" +
                            (parseInt(self.dMargin.val()) || 0)
                            + "px;" +
                            "float:" + self.dAlign.get("value") + ";"
                    }
                };
                self._gen();
                ev.halt();
            }, self);
            self.addRes(_xiami_ok);

            function loadRecordsByPage(page) {
                var query = input.val();
                if (query.replace(/[^\x00-\xff]/g, "@@").length > 30) {
                    alert("长度上限30个字符（1个汉字=2个字符）");
                    return;
                } else if (!S.trim(query) || query == TIP) {
                    alert("不能为空！");
                    return;
                }
                self._xiami_submit.addClass(prefixCls + "editor-button-disabled", undefined);
                var req = S.substitute(XIAMI_URL, {
                    key: encodeURIComponent(input.val()),
                    page: page
                });
                self._xiamia_list.html("<img style='" +
                    "display:block;" +
                    "width:32px;" +
                    "height:32px;" +
                    "margin:5px auto 0 auto;" +
                    "'src='" + loading + "'/>" +
                    "<p style='width: 130px; margin: 15px auto 0; color: rgb(150, 150, 150);'>正在搜索，请稍候......</p>");
                self._xiamia_list.show();

                S.io({
                    cache: false,
                    url: req,
                    dataType: 'jsonp',
                    success: function (data) {
                        data.page = page;
                        self._listSearch(data);
                    },
                    error: function () {
                        self._xiami_submit.removeClass(prefixCls + "editor-button-disabled", undefined);
                        var html = "<p style='text-align:center;margin:10px 0;'>" +
                            "不好意思，超时了，请重试！" +
                            "</p>";
                        self._xiamia_list.html(html);
                    }
                });
            }

            self._xiamia_list.on("click", function (ev) {
                ev.preventDefault();
                var t = new Node(ev.target),
                    add = t.closest(function (node) {
                        return self._xiamia_list.contains(node) &&
                            DOM.hasClass(node, prefixCls + "editor-xiami-add");
                    }, undefined),
                    paging = t.closest(function (node) {
                        return self._xiamia_list.contains(node) &&
                            DOM.hasClass(node, prefixCls + "editor-xiami-page-item");
                    }, undefined);
                if (add) {
                    self._dinfo = {
                        url: ("http://www.xiami.com/widget/" +
                            add.attr("data-value")
                            + "/singlePlayer.swf"),
                        attrs: {
                            title: add.attr("title"),
                            //align:self.dAlign.val(),
                            style: "margin:" +
                                (parseInt(self.dMargin.val()) || 0)
                                + "px;" +
                                "float:" + self.dAlign.get("value") + ";"
                        }
                    };
                    self._gen();
                } else if (paging) {
                    loadRecordsByPage(parseInt(paging.attr("data-value")));
                }
                ev.halt();
            });
            self.addRes(self._xiamia_list);
        },
        _listSearch: function (data) {
            var self = this,
                i,
                editor = self.editor,
                prefixCls = editor.get('prefixCls'),
                re = data['results'],
                html = "";
            // xiami 返回结果自动trim了
            if (data.key == S.trim(self._xiami_input.val())) {
                self._xiami_submit.removeClass(prefixCls + "editor-button-disabled", undefined);
                if (re && re.length) {
                    html = "<ul>";
                    for (i = 0; i < re.length; i++) {
                        var r = re[i], d = getDisplayName(r);
                        html += "<li " +
                            "title='" + d + "'>" +
                            "<span class='" + prefixCls + "editor-xiami-song'>"
                            + limit(d, 35) +
                            "</span>" +
                            "" +
                            "" +
                            //album_id_song_id
                            "<a href='#' " +
                            "title='" + d + "' " +
                            "class='" + prefixCls + "editor-xiami-add' data-value='" +
                            (
                                r['album_id']
                                    + "_"
                                    + r['song_id']
                                )
                            + "'>添加</a>" +
                            "</li>"
                    }
                    html += "</ul>";

                    var page = data.page,
                        totalPage = Math.floor(data['total'] / 8),
                        start = page - 1,
                        end = page + 1;

                    if (totalPage > 1) {
                        html += "<p class='" + prefixCls + "editor-xiami-paging'>";
                        if (start <= 2) {
                            end = Math.min(2 - start + end, totalPage - 1);
                            start = 2;
                        }
                        end = Math.min(end, totalPage - 1);
                        if (end == totalPage - 1) {
                            start = Math.max(2, end - 3);
                        }
                        if (page != 1) {
                            html += getXiamiPaging(page, page - 1, "上一页");
                        }
                        html += getXiamiPaging(page, 1, "1");
                        if (start != 2) {
                            html += "<span class='" + prefixCls + "editor-xiami-page-more'>...</span>";
                        }
                        for (i = start; i <= end; i++) {
                            html += getXiamiPaging(page, i, undefined);
                        }
                        if (end != totalPage) {
                            if (end != totalPage - 1) {
                                html += "<span class='" + prefixCls + "editor-xiami-page-more'>...</span>";
                            }
                            html += getXiamiPaging(page, totalPage, totalPage);
                        }
                        if (page != totalPage) {
                            html += getXiamiPaging(page, page + 1, "下一页");
                        }
                        html += "</p>";
                    }

                } else {
                    html = "<p style='text-align:center;margin:10px 0;'>" +
                        "不好意思，没有找到结果！" +
                        "</p>";
                }
                self._xiamia_list.html(S.substitute(html, {
                    prefixCls: prefixCls
                }));
            }
        },

        _updateD: function () {
            var self = this,
                editor = self.editor,
                prefixCls = editor.get('prefixCls'),
                f = self.selectedFlash;
            if (f) {
                self._xiami_input.val(f.attr("title"));
                self._xiamia_title.html(f.attr("title"));
                self.dAlign.set("value", f.css("float"));
                self.dMargin.val(parseInt(f.style("margin")) || 0);
                self._xiami_url_wrap.hide();
                self.dialog.get("footer").show();
                self._xiamia_title.show();
            } else {
                Editor.Utils.resetInput(self._xiami_input);
                self.dAlign.set("value", "none");
                self.dMargin.val(MARGIN_DEFAULT);
                self._xiami_url_wrap.show();
                self.dialog.get("footer").hide();
                self._xiamia_title.hide();
                self._xiami_submit.removeClass(prefixCls + "editor-button-disabled", undefined);
            }
            self._xiamia_list.hide();
            self._xiamia_list.html("");
        },

        _getDInfo: function () {
            var self = this;
            S.mix(self._dinfo.attrs, {
                width: 257,
                height: 33
            });
            return self._dinfo;
        }

    });


    function getXiamiPaging(page, i, s) {
        return "<a class='{prefixCls}editor-xiami-page-item {prefixCls}editor-button ks-inline-block" +
            ((page == i) ? " {prefixCls}editor-xiami-curpage" : "") +
            "' data-value='" + i + "' href='#'>" + (s || i) + "</a>";
    }

    function getDisplayName(r) {
        return S.urlDecode(r['song_name'])
            + " - "
            + S.urlDecode(r['artist_name']);
    }

    return XiamiMusicDialog;

}, {
    requires: ['editor', '../flash/dialog', '../menubutton']
});
