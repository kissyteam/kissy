/**
 * contextmenu for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("contextmenu", function() {
    var S = KISSY,
        KE = S.Editor,
        Node = S.Node,
        DOM = S.DOM,
        Event = S.Event,
        HTML = "<div>";
    if (KE.ContextMenu) {
        S.log("attach ContextMenu twice", "warn");
        return;
    }

    /**
     * 组合使用 overlay
     * @param config
     */
    function ContextMenu(config) {
        this.cfg = config;
        //editor太复杂，防止循环引用
        //S.clone(config);
        KE.Utils.lazyRun(this, "_prepareShow", "_realShow");
    }

    //暂时将 editor 同 右键关联。
    ContextMenu.ATTRS = {
        editor:{}
    };

    var global_rules = [];
    /**
     * 多菜单管理
     */
    ContextMenu.register = function(cfg) {

        var cm = new ContextMenu(cfg),
            editor = cfg.editor,
            doc = editor.document;

        global_rules.push({
            doc:doc,
            rules:cfg.rules || [],
            instance:cm
        });

        if (!doc.ke_contextmenu) {
            doc.ke_contextmenu = 1;
            Event.on(doc, "mousedown", ContextMenu.hide);
            editor.on("sourcemode", ContextMenu.hide, doc);
            /*
             Event.on(doc, "contextmenu", function(ev) {
             ev.preventDefault();
             });*/
            Event.on(doc.body,
                //"mouseup"
                "contextmenu",
                function(ev) {
                    /*
                     if (ev.which != 3)
                     return;
                     */
                    ContextMenu.hide.call(this);
                    var t = new Node(ev.target);
                    while (t) {
                        var name = t._4e_name(),
                            stop = false;
                        if (name == "body") {
                            break;
                        }
                        for (var i = 0; i < global_rules.length; i++) {
                            var instance = global_rules[i].instance,
                                rules = global_rules[i].rules,
                                doc2 = global_rules[i].doc;
                            if (doc === doc2 &&
                                applyRules(t[0], rules)) {
                                ev.preventDefault();
                                stop = true;
                                //ie 右键作用中，不会发生焦点转移，光标移动
                                //只能右键作用完后才能，才会发生光标移动,range变化
                                //异步右键操作
                                //qc #3764,#3767
                                var x = ev.pageX,
                                    y = ev.pageY;
                                //ie9 没有pageX,pageY,clientX,clientY
                                if (!x) {
                                    var xy = t._4e_getOffset();
                                    x = xy.left;
                                    y = xy.top;
                                }
                                setTimeout(function() {
                                    instance.show(KE.Utils.getXY(x, y, doc,
                                        document));
                                }, 30);

                                break;
                            }
                        }
                        if (stop) {
                            break;
                        }
                        t = t.parent();
                    }
                });
        }
        return cm;
    };

    function applyRules(elem, rules) {
        for (var i = 0;
             i < rules.length;
             i++) {
            var rule = rules[i];
            //增加函数判断
            if (S.isFunction(rule)) {
                if (rule(new Node(elem))) return true;
            }
            else if (DOM.test(elem, rule))return true;
        }
        return false;
    }

    ContextMenu.hide = function() {
        var doc = this;
        for (var i = 0;
             i < global_rules.length;
             i++) {
            var instance = global_rules[i].instance,
                doc2 = global_rules[i].doc;
            if (doc === doc2)
                instance.hide();
        }
    };

    var Overlay = KE.Overlay;
    S.augment(ContextMenu, {
        /**
         * 根据配置构造右键菜单内容
         */
        _init:function() {
            var self = this,
                cfg = self.cfg,
                funcs = cfg.funcs;
            self.el = new Overlay({
                content:HTML,
                autoRender:true,
                width:cfg.width,
                elCls:"ke-menu"
            });
            self.elDom = self.el.get("contentEl").one("div");
            var el = self.elDom;
            for (var f in funcs) {
                var a = new Node("<a href='#'>" + f + "</a>");
                el[0].appendChild(a[0]);
                (function(a, func) {
                    a._4e_unselectable();
                    a.on("click", function(ev) {
                        ev.halt();
                        if (a.hasClass("ke-menuitem-disable")) {
                            return;
                        }
                        //先 hide 还原编辑器内焦点
                        self.hide();

                        //给 ie 一点 hide() 中的事件触发 handler 运行机会，原编辑器获得焦点后再进行下步操作
                        setTimeout(func, 30);
                    });
                })(a, funcs[f]);
            }

        },
        destroy:function() {
            var self = this;
            if (self.el) {
                self.elDom.children().detach();
                self.el.destroy();
            }
        },
        hide : function() {
            this.el && this.el.hide();
        },
        _realShow:function(offset) {
            var self = this;
            //防止ie 失去焦点，取不到复制等状态
            KE.fire("contextmenu", {
                contextmenu:self
            });
            this.el.set("xy", [offset.left,offset.top]);
            var cfg = self.cfg,statusChecker = cfg.statusChecker;
            if (statusChecker) {
                var as = self.elDom.children("a");
                for (var i = 0; i < as.length; i++) {
                    var a = new Node(as[i]);
                    var func = statusChecker[S.trim(a.text())];
                    if (func) {
                        if (func(cfg.editor)) {
                            a.removeClass("ke-menuitem-disable");
                        } else {
                            a.addClass("ke-menuitem-disable");
                        }
                    }
                }
            }
            this.el.show();
        },
        _prepareShow:function() {
            this._init();
        },
        show:function(offset) {
            this._prepareShow(offset);
        }
    });

    KE.ContextMenu = ContextMenu;
}, {
    attach:false,
    requires:["overlay"]
});
