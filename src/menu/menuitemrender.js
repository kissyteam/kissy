/**
 * simple menuitem render
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/menuitemrender", function(S, Node, UIBase, Component) {


    var HIGHLIGHTED_CLS = "{prefixCls}menuitem-highlight",
        CONTENTBOX_CLS = "{prefixCls}contentbox",
        SELECTED_CLS = "{prefixCls}menuitem-selected",
        CHECKED_CLS = "{prefixCls}menuitem-checked",
        ACTIVE_CLS = "{prefixCls}menuitem-active",
        CHECK_CLS = "{prefixCls}menuitem-checkbox",
        CONTENT_CLS = "{prefixCls}menuitem-content",
        EL_CLS = "{prefixCls}menuitem",
        DISABLED_CLS = "{prefixCls}menuitem-disabled";

    function getCls(self, str) {
        return S.substitute(str, {
            prefixCls:self.get("prefixCls")
        });
    }

    function setUpCheckEl(self) {
        var el = self.get("el"),
            cls = getCls(self, CHECK_CLS),
            checkEl = el.one("." + cls);
        if (!checkEl) {
            checkEl = new Node("<div class='" + cls + "'/>").prependTo(el);
            // if not ie will lose focus when click
            checkEl.unselectable();
        }
        return checkEl;
    }

    return UIBase.create(Component.Render, [UIBase.Contentbox.Render], {
        renderUI:function() {
            var self = this,
                el = self.get("el");
            var cls = getCls(self, CONTENTBOX_CLS);
            el.addClass(getCls(self, EL_CLS))
                .attr("role", "menuitem");
            self.get("contentEl").addClass(getCls(self, CONTENT_CLS));
            if (!el.attr("id")) {
                el.attr("id", S.guid("ks-menuitem"));
            }
        },

        _uiSetDisabled:function(v) {
            var el = this.get("el").attr("aria-disabled", !!v);
            if (v) {
                el.addClass(getCls(this, DISABLED_CLS));
            } else {
                el.removeClass(getCls(this, DISABLED_CLS));
            }
        },

        _uiSetHighlighted:function(v) {
            var el = this.get("el");
            if (v) {
                el.addClass(getCls(this, HIGHLIGHTED_CLS));
            } else {
                el.removeClass(getCls(this, HIGHLIGHTED_CLS));
            }
        },

        _uiSetSelected:function(v) {
            var el = this.get("el");
            el[v ? "addClass" : "removeClass"](getCls(this, SELECTED_CLS));
        },

        _uiSetChecked:function(v) {
            var el = this.get("el");
            el[v ? "addClass" : "removeClass"](getCls(this, CHECKED_CLS));
            v && setUpCheckEl(this);
        },

        _uiSetSelectable:function(v) {
            this.get("el").attr("role", v ? 'menuitemradio' : 'menuitem');
        },

        _uiSetCheckable:function(v) {
            this.get("el").attr("role", v ? 'menuitemcheckbox' : 'menuitem');
        },

        _handleMouseDown:function() {
            var el = this.get("el");
            el.addClass(getCls(this, ACTIVE_CLS));
            el.attr("aria-pressed", true);
        },

        _handleMouseUp:function() {
            var el = this.get("el");
            el.removeClass(getCls(this, ACTIVE_CLS));
            el.attr("aria-pressed", false);
        },

        containsElement:function(element) {
            var el = this.get("el");
            return el[0] == element || el.contains(element);
        }
    }, {
        ATTRS:{
            /**
             * 是否支持焦点处理
             * @override
             */
            focusable:{
                value:false
            },
            highlighted:{},
            selected:{},
            // @inheritedDoc
            // content:{},
            // 属性必须声明，否则无法和 _uiSetChecked 绑定在一起
            checked:{},
            visibleMode:{
                value:"display"
            }
        }
    });
}, {
    requires:['node','uibase','component']
});