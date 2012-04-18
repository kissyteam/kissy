/**
 * draft for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/draft/index", function (S, KE, localStorage, Overlay, Select) {
    var Node = S.Node,
        LIMIT = 5,
        Event = S.Event,
        INTERVAL = 5,
        JSON = S['JSON'],
        DRAFT_SAVE = "ke-draft-save20110503";

    function padding(n, l, p) {
        n += "";
        while (n.length < l) {
            n = p + n;
        }
        return n;
    }

    function date(d) {
        if (S.isNumber(d)) {
            d = new Date(d);
        }
        if (d instanceof Date)
            return [
                d.getFullYear(),
                "-",
                padding(d.getMonth() + 1, 2, "0"),
                "-",
                padding(d.getDate(), 2, "0"),
                " ",
                //"&nbsp;",
                padding(d.getHours(), 2, "0"),
                ":",
                padding(d.getMinutes(), 2, "0"),
                ":",
                padding(d.getSeconds(), 2, "0")
                //"&nbsp;",
                //"&nbsp;"
            ].join("");
        else
            return d;
    }

    function Draft(editor) {
        this.editor = editor;
        this._init();
    }

    var addRes = KE.Utils.addRes, destroyRes = KE.Utils.destroyRes;
    S.augment(Draft, {

        _getSaveKey:function () {
            var self = this,
                editor = self.editor,
                cfg = editor.get("pluginConfig");
            return cfg.draft && cfg.draft['saveKey'] || DRAFT_SAVE;
        },

        /**
         * parse 历史记录延后，点击 select 时才开始 parse
         */
        _getDrafts:function () {
            var self = this;
            if (!self.drafts) {
                var str = localStorage.getItem(self._getSaveKey()),
                    drafts = [];
                if (str) {
                    /**
                     * 原生 localStorage 必须串行化
                     */
                    drafts = (localStorage == window.localStorage) ?
                        JSON.parse(decodeURIComponent(str)) : str;
                }
                self.drafts = drafts;
            }
            return self.drafts;
        },
        _init:function () {

            var self = this,
                editor = self.editor,
                statusbar = editor.get("statusBarEl"),
                cfg = editor.get("pluginConfig");
            cfg.draft = cfg.draft || {};
            self.draftInterval = cfg.draft.interval
                = cfg.draft.interval || INTERVAL;
            self.draftLimit = cfg.draft.limit
                = cfg.draft.limit || LIMIT;
            var holder = new Node(
                "<div class='ke-draft'>" +
                    "<span class='ke-draft-title'>" +
                    "内容正文每" +
                    cfg.draft.interval
                    + "分钟自动保存一次。" +
                    "</span>" +
                    "</div>").appendTo(statusbar);
            self.timeTip = new Node("<span class='ke-draft-time'/>")
                .appendTo(holder);

            var save = new Node(
                "<a href='#' " +
                    "onclick='return false;' " +
                    "class='ke-button ke-draft-save-btn' " +
                    "style='" +
                    "vertical-align:middle;" +
                    "padding:1px 9px;" +
                    "'>" +
                    "<span class='ke-draft-mansave'>" +
                    "</span>" +
                    "<span>立即保存</span>" +
                    "</a>"
            ).unselectable()
                .appendTo(holder),
                versions = new Select({
                    container:holder,
                    menuContainer:document.body,
                    doc:editor.get("document")[0],
                    width:"85px",
                    popUpWidth:"225px",
                    align:["r", "t"],
                    emptyText:"&nbsp;&nbsp;&nbsp;尚无编辑器历史存在",
                    title:"恢复编辑历史"
                });
            self.versions = versions;
            //点击才开始 parse
            versions.on("select", function () {
                versions.detach("select", arguments.callee);
                self.sync();
            });
            save.on("click", function (ev) {
                self.save(false);
                //如果不阻止，部分页面在ie6下会莫名奇妙把其他input的值丢掉！
                ev.halt();
            });

            addRes.call(self, save);


            /*
             监控form提交，每次提交前保存一次，防止出错
             */
            if (editor.get("textarea")[0].form) {
                (function () {
                    var textarea = editor.get("textarea"),
                        form = textarea[0].form;

                    function saveF() {
                        self.save(true);
                    }

                    Event.on(form, "submit", saveF);
                    addRes.call(self, function () {
                        Event.remove(form, "submit", saveF);
                    });

                })();
            }

            var timer = setInterval(function () {
                self.save(true);
            }, self.draftInterval * 60 * 1000);

            addRes.call(self, function () {
                clearInterval(timer);
            });

            versions.on("click", self.recover, self);
            addRes.call(self, versions);
            self.holder = holder;
            if (cfg.draft['helpHtml']) {

                var help = new Node('<a ' +
                    'tabindex="0" ' +
                    'hidefocus="hidefocus" ' +
                    'class="ke-draft-help ke-triplebutton-off" ' +
                    'title="点击查看帮助" ' +
                    'href="javascript:void(\'点击查看帮助 \')">点击查看帮助</a>')
                    .unselectable()
                    .appendTo(holder);

                help.on("click", function () {
                    help[0].focus();
                    if (self.helpPopup && self.helpPopup.get("visible")) {
                        self.helpPopup.hide();
                    } else {
                        self._prepareHelp();
                    }
                });
                help.on("blur", function () {
                    self.helpPopup && self.helpPopup.hide();
                });
                self.helpBtn = help;
                addRes.call(self, help);
                KE.Utils.lazyRun(self, "_prepareHelp", "_realHelp");
            }
            addRes.call(self, holder);
        },
        _prepareHelp:function () {
            var self = this,
                editor = self.editor,
                cfg = editor.get("pluginConfig"),
                draftCfg = cfg.draft,
                help = new Node(draftCfg['helpHtml'] || "");
            var arrowCss = "height:0;" +
                "position:absolute;" +
                "fontSize:0;" +
                "width:0;" +
                "border:8px #000 solid;" +
                "border-color:#000 transparent transparent transparent;" +
                "border-style:solid dashed dashed dashed;";
            var arrow = new Node("<div style='" +
                arrowCss +
                "border-top-color:#CED5E0;" +
                "'>" +
                "<div style='" +
                arrowCss +
                "left:-8px;" +
                "top:-10px;" +
                "border-top-color:white;" +
                "'>" +
                "</div>" +
                "</div>");
            help.append(arrow);
            help.css({
                border:"1px solid #ACB4BE",
                "text-align":"left"
            });
            self.helpPopup = new Overlay({
                content:help,
                autoRender:true,
                width:help.width() + "px",
                mask:false
            });
            self.helpPopup.get("el")
                .css("border", "none");
            self.helpPopup.arrow = arrow;
        },
        _realHelp:function () {
            var win = this.helpPopup,
                helpBtn = this.helpBtn,
                arrow = win.arrow;
            win.show();
            var off = helpBtn.offset();
            win.get("el").offset({
                left:(off.left - win.get("el").width()) + 17,
                top:(off.top - win.get("el").height()) - 7
            });
            arrow.offset({
                left:off.left - 2,
                top:off.top - 8
            });
        },
        disable:function () {
            this.holder.css("visibility", "hidden");
        },
        enable:function () {
            this.holder.css("visibility", "");
        },
        sync:function () {
            var self = this,
                draftLimit = self.draftLimit,
                timeTip = self.timeTip,
                versions = self.versions,
                drafts = self._getDrafts();
            if (drafts.length > draftLimit)
                drafts.splice(0, drafts.length - draftLimit);
            var items = [], draft, tip;
            for (var i = 0; i < drafts.length; i++) {
                draft = drafts[i];
                tip = (draft.auto ? "自动" : "手动") + "保存于 : "
                    + date(draft.date);
                items.push({
                    name:tip,
                    value:i
                });
            }
            versions.set("items", items.reverse());
            timeTip.html(tip);
            localStorage.setItem(self._getSaveKey(),
                (localStorage == window.localStorage) ?
                    encodeURIComponent(JSON.stringify(drafts))
                    : drafts);
        },

        save:function (auto) {
            var self = this,
                drafts = self._getDrafts(),
                editor = self.editor,
                //不使用rawdata
                //undo 只需获得可视区域内代码
                //可视区域内代码！= 最终代码
                //代码模式也要支持草稿功能
                //统一获得最终代码
                data = editor.get("formatData");

            //如果当前内容为空，不保存版本
            if (!data) {
                return;
            }

            if (drafts[drafts.length - 1] &&
                data == drafts[drafts.length - 1].content) {
                drafts.length -= 1;
            }
            self.drafts = drafts.concat({
                content:data,
                date:new Date().getTime(),
                auto:auto
            });
            self.sync();
        },

        recover:function (ev) {
            var self = this,
                editor = self.editor,
                versions = self.versions,
                drafts = self._getDrafts(),
                v = ev.newVal;
            versions.reset("value");
            if (confirm("确认恢复 " + date(drafts[v].date) + " 的编辑历史？")) {
                editor.execCommand("save");
                editor.set("data", drafts[v].content);
                editor.execCommand("save");
            }
            ev.halt();
        },
        destroy:function () {
            destroyRes.call(this);
        }
    });

    function init(editor) {
        var d = new Draft(editor);
        editor.on("destroy", function () {
            d.destroy();
        });
    }

    return {
        init:function (editor) {
            if (localStorage.ready) {
                localStorage.ready(function () {
                    init(editor);
                });
            } else {
                init(editor);
            }
        }
    };
}, {
    "requires":["editor", "../localStorage/", "overlay", '../select/']
});