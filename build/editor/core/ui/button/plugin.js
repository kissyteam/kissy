/**
 * triple state button for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("button", function () {
    var S = KISSY,
        KE = S.Editor,
        ON = "on",
        OFF = "off",
        UIBase=S.require("uibase"),
        DISABLED = "disabled",
        BUTTON_CLASS = "ke-triplebutton",
        ON_CLASS = "ke-triplebutton-on",
        OFF_CLASS = "ke-triplebutton-off",
        ACTIVE_CLASS = "ke-triplebutton-active",
        DISABLED_CLASS = "ke-triplebutton-disabled";

    if (KE.TripleButton) {
        S.log("TripleButton attach twice", "warn");
        return;
    }

    function getTipText(str) {
        if (str && str.indexOf("<") == -1) {
            return str;
        }
        return 0;
    }

    var TripleButton = UIBase.create([UIBase['Box']['Render']
        || UIBase['Box']
    ], {
        _updateHref:function () {
            var self = this;
            self.get("el").attr("href", "javascript:void('" +
                (getTipText(self.get("text")) || getTipText(self.get("title")) ) + "')");
        },
        bindUI:function () {
            var self = this, el = self.get("el");
            el.on("click", self['_action'], self);
            //添加鼠标点击视觉效果
            el.on("mousedown", function () {
                if (self.get("state") == OFF) {
                    el.addClass(ACTIVE_CLASS);
                }
            });
            el.on("mouseup mouseleave", function () {
                if (self.get("state") == OFF &&
                    el.hasClass(ACTIVE_CLASS)) {
                    //click 后出发
                    setTimeout(function () {
                        el.removeClass(ACTIVE_CLASS);
                    }, 300);
                }
            });
        },
        _uiSetTitle:function () {
            var self = this;
            self.get("el").attr("title", self.get("title"));
            self._updateHref();
        },
        _uiSetContentCls:function (contentCls) {
            var self = this,
                el = self.get("el");
            if (contentCls !== undefined) {
                el.html("<span class='ke-toolbar-item " + contentCls + "' />");
                //ie 失去焦点
                el._4e_unselectable();
            }
        },
        _uiSetText:function (text) {
            var self = this,
                el = self.get("el");
            el.html(text);
            self._updateHref();
        },
        _uiSetState:function (n) {
            this["_" + n]();
        },
        disable:function () {
            var self = this;
            self._savedState = self.get("state");
            self.set("state", DISABLED);
        },
        enable:function () {
            var self = this;
            if (self.get("state") == DISABLED)
                self.set("state", self._savedState);
        },
        _action:function (ev) {
            var self = this;
            self.fire(self.get("state") + "Click", {
                TripleEvent:ev
            });
            self.fire("click", {
                TripleClickType:self.get("state") + "Click"
            });
            ev && ev.preventDefault();
        },
        bon:function () {
            this.set("state", ON);
        },
        boff:function () {
            this.set("state", OFF);
        },
        _on:function () {
            var el = this.get("el");
            el.removeClass(OFF_CLASS + " " + DISABLED_CLASS);
            el.addClass(ON_CLASS);
        },
        _off:function () {
            var el = this.get("el");
            el.removeClass(ON_CLASS + " " + DISABLED_CLASS);
            el.addClass(OFF_CLASS);
        },
        _disabled:function () {
            var el = this.get("el");
            el.removeClass(OFF_CLASS + " " + ON_CLASS);
            el.addClass(DISABLED_CLASS);
        }
    }, {
        ATTRS:{
            state:{value:OFF},
            elCls:{value:[BUTTON_CLASS, OFF_CLASS].join(" ")},
//            elAttrs:{
//                value:{
//                    // can trigger keyboard click
//                    // href:"#",
//                    // onclick:"return false;"
//                    //可以被 tab 定位
//                    // tabIndex:0
//                }
//            },
            elTagName:{value:"a"},
            title:{},
            contentCls:{},
            text:{}
        }
    });

    TripleButton.ON = ON;
    TripleButton.OFF = OFF;
    TripleButton.DISABLED = DISABLED;
    TripleButton.ON_CLASS = ON_CLASS;
    TripleButton.OFF_CLASS = OFF_CLASS;
    TripleButton.DISABLED_CLASS = DISABLED_CLASS;


    KE.TripleButton = TripleButton;
    /**
     * 将button ui 和点击功能分离
     * 按钮必须立刻显示出来，功能可以慢慢加载
     * @param name
     * @param btnCfg
     */
    KE.prototype.addButton = function (name, btnCfg) {
        var self = this,
            editor = self,
            b = new TripleButton({
                render:self.toolBarDiv,
                autoRender:true,
                title:btnCfg.title,
                text:btnCfg.text,
                contentCls:btnCfg.contentCls
            }),
            context = {
                name:name,
                btn:b,
                editor:self,
                cfg:btnCfg,
                call:function () {
                    var args = S.makeArray(arguments),
                        method = args.shift();
                    return btnCfg[method].apply(context, args);
                },
                /**
                 * 依赖于其他模块，先出来占位！
                 * @param cfg
                 */
                reload:function (cfg) {
                    S.mix(btnCfg, cfg);
                    b.enable();
                    self.on("selectionChange", function () {
                        if (self.getMode() == KE.SOURCE_MODE) return;
                        btnCfg.selectionChange && btnCfg.selectionChange.apply(context, arguments);
                    });
                    b.on("click", function (ev) {
                        var t = ev.TripleClickType;
                        if (btnCfg[t]) btnCfg[t].apply(context, arguments);
                        ev && ev.halt();
                    });
                    if (btnCfg.mode == KE.WYSIWYG_MODE) {
                        editor.on("wysiwygmode", b.enable, b);
                        editor.on("sourcemode", b.disable, b);
                    }
                    btnCfg.init && btnCfg.init.call(context);
                },
                destroy:function () {
                    if (btnCfg['destroy']) btnCfg['destroy'].call(context);
                    b.destroy();
                }
            };
        if (btnCfg.loading) {
            b.disable();
        } else {
            //否则立即初始化，开始作用
            context.reload(undefined);
        }
        return context;
    };
}, {
    attach:false
});
