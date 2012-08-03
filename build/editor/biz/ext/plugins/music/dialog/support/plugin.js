KISSY.Editor.add("xiami-music/dialog/support", function() {
    var S = KISSY,
        UA = S.UA,
        KE = S.Editor,
        DOM = S.DOM,
        Node = S.Node,
        loading = KE['Config'].base + "../theme/loading.gif",
        CLS_XIAMI = "ke_xiami",
        TYPE_XIAMI = "xiami-music",
        BTIP = "搜 索",
        TIP = "输入歌曲名、专辑名、艺人名";


    var css = '.ke-xiami-list {' +
        'margin:10px 0 10px 0;' +
        'padding:10px 20px 0 20px;' +
        'border-top:1px solid #CED5E0;' +
        'display:none;' +
        '}' +
        '' +
        '' +
        '.ke-xiami-list li{' +
        'border:1px solid #CED5E0;' +
        'border-width:0 0 1px 0;' +
        'overflow:hidden;' +
        'zoom:1;' +
        'color:#646464;' +
        'height:24px;' +
        'line-height:24px;' +
        'padding:0 20px 0 10px;' +
        '}' +
        '' +
        '' +
        '.ke-xiami-list .ke-xiami-add {' +
        'float:right;' +
        '}' +
        '' +
        '' +
        '' +
        '.ke-xiami-list .ke-xiami-song {' +
        'float:left;' +
        'width:300px;' +
        'white-space:nowrap;' +
        'overflow:hidden;' +
        '}' +
        '' +
        '' +
        '.ke-xiami-paging a{' +
        'display: inline-block;'
        + ' zoom: 1; '
        + ' *display: inline; '
        + 'padding:1px 7px;'
        + 'margin:0 3px;' +
        '}' +
        '' +
        '' +
        '.ke-xiami-paging a:hover,.ke-xiami-paging a.ke-xiami-curpage {' +
        'color:red;' +
        'text-decoration:none;' +
        '}' +
        '' +
        '' +
        '.ke-xiami-paging {' +
        'text-align:center;' +
        'margin:20px -10px 0 -10px;' +
        '}' +
        '' +
        '.ke-xiami-page-more {' +
        'padding:0 10px;' +
        '}';
    DOM.addStyleSheet(css, "XiamiMusic");


    function limit(str, l) {
        if (str.length > l)
            str = str.substring(0, l) + "...";
        return str;
    }

    var MIDDLE = "vertical-align:middle;",
        MARGIN_DEFAULT = 0,
        bodyHtml = "<div style='padding:20px 0;'>" +
            "<form action='#' class='ke-xiami-form' style='margin:0 20px;'>" +
            "<p class='ke-xiami-title'>" +
            "" +
            "</p>" +
            "<p class='ke-xiami-url-wrap'>" +
            "<input class='ke-xiami-url ke-input' " +
            "style='width:374px;" + (UA['ie'] == 6 ? "":MIDDLE)
            + "'" +
            "/> &nbsp; " +
            " <a " +
            "class='ke-xiami-submit ke-button'" +
            ">"
            + BTIP + "</a>" +
            "</p>" +
            "<p " +
            "style='margin:10px 0'>" +
            "<label>对 齐： " +
            "<select " +
            "class='ke-xiami-align' title='对齐'>" +
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
            "class='ke-xiami-margin ke-input' style='width:60px;" +
            MIDDLE + "' value='"
            + MARGIN_DEFAULT + "'/> 像素" +
            "</label>" +
            "</p>" +
            "</form>" +
            "<div " +
            "class='ke-xiami-list'>" +
            "</div>" +
            "</div>",
        footHtml = "<div style='padding:5px 20px 20px;'><a " +
            "class='ke-xiami-ok ke-button' " +
            "style='margin-right:20px;'>确&nbsp;定</a>" +
            "<a class='ke-xiami-cancel ke-button'>取&nbsp;消</a></div>";

    function XiamiMusicDialog(editor) {
        XiamiMusicDialog['superclass'].constructor.apply(this, arguments);
    }

    KE.XiamiMusic.Dialog = XiamiMusicDialog;

    S.extend(XiamiMusicDialog, KE.Flash.FlashDialog, {
        _config:function() {
            var self = this;
            self._cls = CLS_XIAMI;
            self._type = TYPE_XIAMI;
            self._title = "虾米音乐";//属性";
            self._bodyHtml = bodyHtml;
            self._footHtml = footHtml;
        },
        _initD:function() {
            var self = this,
                editor = self.editor,
                d = self.dialog,
                del = d.get("el"),
                dfoot = d.get("footer"),
                input = del.one(".ke-xiami-url");
            self.dAlign = KE.Select.decorate(del.one(".ke-xiami-align"));
            self.addRes(self.dAlign);
            self._xiami_input = input;
            KE.Utils.placeholder(input, TIP);
            self.addRes(input);
            self._xiamia_list = del.one(".ke-xiami-list");
            self._xiami_submit = del.one(".ke-xiami-submit");
            self._xiami_submit.on("click", function(ev) {
                if (!self._xiami_submit.hasClass("ke-triplebutton-disabled"))
                    loadRecordsByPage(1);
                ev.halt();
            });
            self.addRes(self._xiami_submit);
            input.on("keydown", function(ev) {
                if (ev.keyCode === 13) {
                    loadRecordsByPage(1);
                }
            });
            self.dMargin = del.one(".ke-xiami-margin");
            self._xiami_url_wrap = del.one(".ke-xiami-url-wrap");
            self._xiamia_title = del.one(".ke-xiami-title");

            var _xiami_ok = dfoot.one(".ke-xiami-ok");
            dfoot.one(".ke-xiami-cancel").on("click", function(ev) {
                d.hide();
                ev.halt();
            });
            self.addRes(dfoot);
            _xiami_ok.on("click", function(ev) {
                var f = self.selectedFlash,
                    r = editor.restoreRealElement(f);
                self._dinfo = {
                    url:self._getFlashUrl(r),
                    attrs:{
                        title:f.attr("title"),
                        //align:self.dAlign.val(),
                        style:
                            "margin:" +
                                (parseInt(self.dMargin.val()) || 0)
                                + "px;" +
                                "float:" + self.dAlign.val() + ";"
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
                self._xiami_submit.addClass("ke-triplebutton-disabled");
                //self._xiami_submit.disable();
                var params = {
                    key:encodeURIComponent(input.val()),
                    page:page,
                    random:(new Date().getTime())
                };
                var req = getXiamiUrl(params);
                callback_xiami.instance = self;
                callback_xiami.page = page;
                self._xiamia_list.html("<img style='" +
                    "display:block;" +
                    "width:32px;" +
                    "height:32px;" +
                    "margin:5px auto 0 auto;" +
                    "'src='" + loading + "'/>" +
                    "<p style='width: 130px; margin: 15px auto 0; color: rgb(150, 150, 150);'>正在搜索，请稍候......</p>");
                self._xiamia_list.show();
                var node = S.getScript(req, {
                    timeout:10,
                    success:function() {
                    },
                    error:function() {
                        node.src = '';
                        self._xiami_submit.removeClass("ke-triplebutton-disabled");
                        //self._xiami_submit.enable();
                        var html = "<p style='text-align:center;margin:10px 0;'>" +
                            "不好意思，超时了，请重试！" +
                            "</p>";
                        self._xiamia_list.html(html);
                    }
                });


            }

            self._xiamia_list.on("click", function(ev) {
                ev.preventDefault();
                var t = new Node(ev.target),
                    add = t._4e_ascendant(function(node) {
                        return self._xiamia_list.contains(node) &&
                            node.hasClass("ke-xiami-add");
                    }, true),
                    paging = t._4e_ascendant(function(node) {
                        return self._xiamia_list.contains(node) &&
                            node.hasClass("ke-xiami-page-item");
                    }, true);
                if (add) {
                    self._dinfo = {
                        url:("http://www.xiami.com/widget/" +
                            add.attr("data-value")
                            + "/singlePlayer.swf"),
                        attrs:{
                            title:add.attr("title"),
                            //align:self.dAlign.val(),
                            style:
                                "margin:" +
                                    (parseInt(self.dMargin.val()) || 0)
                                    + "px;" +
                                    "float:" + self.dAlign.val() + ";"
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
        _listSearch:function(data) {
            var self = this,
                i,
                re = data['results'],
                html = "";
            //xiami 返回结果自动trim了
            if (data.key == S.trim(self._xiami_input.val())) {
                self._xiami_submit.removeClass("ke-triplebutton-disabled");
                //self._xiami_submit.enable();
                if (re && re.length) {
                    html = "<ul>";
                    for (i = 0; i < re.length; i++) {
                        var r = re[i],d = getDisplayName(r);
                        html += "<li " +
                            "title='" + d + "'>" +
                            "<span class='ke-xiami-song'>"
                            + limit(d, 35) +
                            "</span>" +
                            "" +
                            "" +
                            //album_id_song_id
                            "<a href='#' " +
                            "title='" + d + "' " +
                            "class='ke-xiami-add' data-value='" +
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
                        totalpage = Math.floor(data['total'] / 8),
                        start = page - 1,
                        end = page + 1;

                    if (totalpage > 1) {
                        html += "<p class='ke-xiami-paging'>";
                        if (start <= 2) {
                            end = Math.min(2 - start + end, totalpage - 1);
                            start = 2;
                        }
                        end = Math.min(end, totalpage - 1);
                        if (end == totalpage - 1) {
                            start = Math.max(2, end - 3);
                        }
                        if (page != 1) {
                            html += getXiamiPaging(page, page - 1, "上一页");
                        }
                        html += getXiamiPaging(page, 1, "1");
                        if (start != 2) {
                            html += "<span class='ke-xiami-page-more'>...</span>";
                        }
                        for (i = start; i <= end; i++) {
                            html += getXiamiPaging(page, i, undefined);
                        }
                        if (end != totalpage) {
                            if (end != totalpage - 1) {
                                html += "<span class='ke-xiami-page-more'>...</span>";
                            }
                            html += getXiamiPaging(page, totalpage, totalpage);
                        }
                        if (page != totalpage) {
                            html += getXiamiPaging(page, page + 1, "下一页");
                        }
                        html += "</p>";
                    }

                } else {
                    html = "<p style='text-align:center;margin:10px 0;'>" +
                        "不好意思，没有找到结果！" +
                        "</p>";
                }
                self._xiamia_list.html(html);
            }
        },

        _updateD : function() {
            var self = this,
                f = self.selectedFlash;
            if (f) {
                self._xiami_input.val(f.attr("title"));
                self._xiamia_title.html(f.attr("title"));
                self.dAlign.val(f.css("float"));
                self.dMargin.val(parseInt(f._4e_style("margin")) || 0);
                self._xiami_url_wrap.hide();
                self.dialog.get("footer").show();
                self._xiamia_title.show();
            } else {
                KE.Utils.resetInput(self._xiami_input);
                self.dAlign.val("none");
                self.dMargin.val(MARGIN_DEFAULT);
                self._xiami_url_wrap.show();
                self.dialog.get("footer").hide();
                self._xiamia_title.hide();
                self._xiami_submit.removeClass("ke-triplebutton-disabled");
                //self._xiami_submit.enable();
            }
            self._xiamia_list.hide();
            self._xiamia_list.html("");
        },

        _getDInfo:function() {
            var self = this;
            S.mix(self._dinfo.attrs, {
                width:257,
                height:33
            });
            return self._dinfo;
        }

    });


    function getXiamiPaging(page, i, s) {
        return "<a class='ke-xiami-page-item ke-button" +
            ((page == i) ? " ke-xiami-curpage" : "") +
            "' data-value='" + i + "' href='#'>" + (s || i) + "</a>";
    }

    function getDisplayName(r) {
        return decodeURIComponent(r['song_name'])
            + " - "
            + decodeURIComponent(r['artist_name']);
    }

    XiamiMusicDialog.callback_xiami = function(data) {
        var self = callback_xiami.instance;
        data.page = callback_xiami.page;
        self._listSearch(data);
    };
    var callback_xiami = XiamiMusicDialog.callback_xiami;
    var xiami_url = "http://www.xiami.com/app/nineteen/search/key/" +
        "${key}/page/${page}?" +
        "random=${random}&callback=KISSY.Editor.XiamiMusic.Dialog.callback_xiami";

    function getXiamiUrl(params) {
        return xiami_url.replace(/\${([^}]+)}/g, function(m, m1) {
            return params[m1];
        });
    }

}, {
    attach:false
});