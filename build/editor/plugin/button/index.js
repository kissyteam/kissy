/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 31 22:01
*/
/**
 * triple state button for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/button/index", function (S, Editor, Component) {
    var ON = "on",
        OFF = "off",
        DISABLED = "disabled",
        BUTTON_CLASS = "ks-editor-triplebutton",
        ON_CLASS = "ks-editor-triplebutton-on",
        OFF_CLASS = "ks-editor-triplebutton-off",
        ACTIVE_CLASS = "ks-editor-triplebutton-active",
        DISABLED_CLASS = "ks-editor-triplebutton-disabled";

    function getTipText(str) {
        if (str && str.indexOf("<") == -1) {
            return str;
        }
        return 0;
    }

    var TripleButton = Component.define([Component.UIBase['Box']['Render']], {
        _updateHref:function () {
            var self = this;
            self.get("el").attr("href", "javascript:void('" +
                (getTipText(self.get("text")) || getTipText(self.get("title")) ) + "')");
        },
        bindUI:function () {
            var self = this,
                keepFocus = self.get("keepFocus"),
                el = self.get("el");
            el.on("click", self['_action'], self);
            // make ie do not lose focus
            if (keepFocus) {
                el.unselectable();
            }
            // 添加鼠标点击视觉效果
            el.on("mousedown", function (e) {
                if (self.get("state") == OFF) {
                    el.addClass(ACTIVE_CLASS);
                }
                // make non-ie do not lose focus
                if (keepFocus) {
                    e.halt();
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
                el.html("<span class='ks-editor-toolbar-item " + contentCls + "' />");
                if (self.get('keepFocus')) {
                    el.unselectable(undefined);
                }
            }
        },
        _uiSetText:function (text) {
            var self = this,
                el = self.get("el");
            el.html(text);
            self._updateHref();
        },
        _uiSetState:function (n, ev) {
            this["_" + n](ev);
        },
        disable:function () {
            var self = this;
            self.set("state", DISABLED);
        },
        enable:function () {
            var self = this;
            if (self.get("state") == DISABLED) {
                self.set("state", self._savedState);
            }
        },
        _action:function (ev) {
            var self = this;
            self.fire(self.get("state") + "Click", {
                "TripleEvent":ev
            });
            self.fire("click", {
                TripleClickType:self.get("state") + "Click"
            });
            if (!self.get("keepFocus")) {
                // chrome will make body focus
                self.get("el")[0].focus();
            }
        },
        bon:function () {
            this.set("state", ON);
        },
        boff:function () {
            this.set("state", OFF);
        },
        _on:function () {
            var el = this.get("el");
            el.removeClass(OFF_CLASS + " " + DISABLED_CLASS)
                .addClass(ON_CLASS);
        },
        _off:function () {
            var el = this.get("el");
            el.removeClass(ON_CLASS + " " + DISABLED_CLASS)
                .addClass(OFF_CLASS);
        },
        _disabled:function (ev) {
            var el = this.get("el");
            this._savedState = ev.prevVal;
            el.removeClass(OFF_CLASS + " " + ON_CLASS)
                .addClass(DISABLED_CLASS);
        }
    }, {
        name:"editor/plugin/button",
        ATTRS:{
            state:{value:OFF},
            elCls:{value:[BUTTON_CLASS, OFF_CLASS].join(" ")},
            elTagName:{value:"a"},
            title:{},
            contentCls:{},
            text:{},
            keepFocus:{
                value:true
            }
        }
    });

    TripleButton.ON = ON;
    TripleButton.OFF = OFF;
    TripleButton.DISABLED = DISABLED;
    TripleButton.ON_CLASS = ON_CLASS;
    TripleButton.OFF_CLASS = OFF_CLASS;
    TripleButton.DISABLED_CLASS = DISABLED_CLASS;


    Editor.TripleButton = TripleButton;
    /**
     * 将 button ui 和点击功能分离
     */
    Editor.prototype.addButton = function (cfg, methods, ButtonType) {
        ButtonType = ButtonType || TripleButton;
        var self = this,
            b = new ButtonType(S.mix({
                render:self.get("toolBarEl"),
                autoRender:true,
                editor:self
            }, cfg));

        S.mix(b, methods);

        if (b.init) {
            b.init();
        }

        self.on("selectionChange", function () {
            if (self.get("mode") == Editor.SOURCE_MODE) {
                return;
            }
            b.selectionChange && b.selectionChange.apply(b, arguments);
        });

        b.on("click", function (ev) {
            var t = ev.TripleClickType;
            if (b[t]) {
                b[t].apply(b, arguments);
            }
        });

        if (b.get("mode") == Editor.WYSIWYG_MODE) {
            self.on("wysiwygMode", b.enable, b);
            self.on("sourceMode", b.disable, b);
        }

        self.on("destroy", function () {
            b.destroy();
        });

        return b;
    };

    return TripleButton;
}, {
    requires:['editor', 'component']
});
