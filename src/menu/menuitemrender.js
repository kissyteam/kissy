/**
 * simple menuitem render
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/menuitemrender", function(S, Node, UIBase, Component) {


    var HIGHLIGHTED_CLS = "menuitem-highlight",
        CONTENTBOX_CLS = "contentbox",
        SELECTED_CLS = "menuitem-selected",
        CHECKED_CLS = "menuitem-checked",
        ACTIVE_CLS = "menuitem-active",
        CHECK_CLS = "menuitem-checkbox",
        CONTENT_CLS = "menuitem-content",
        EL_CLS = "menuitem",
        DISABLED_CLS = "menuitem-disabled";

    function setUpCheckEl(self) {
        var el = self.get("el"),
            cls = self.getCls(CHECK_CLS),
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
            var cls = self.getCls(CONTENTBOX_CLS);
            el.addClass(self.getCls(EL_CLS))
                .attr("role", "menuitem");
            self.get("contentEl").addClass(self.getCls(CONTENT_CLS));
            if (!el.attr("id")) {
                el.attr("id", S.guid("ks-menuitem"));
            }
        },

        _uiSetDisabled:function(v) {
            var self = this,el = self.get("el").attr("aria-disabled", !!v);
            if (v) {
                el.addClass(self.getCls(DISABLED_CLS));
            } else {
                el.removeClass(self.getCls(DISABLED_CLS));
            }
        },

        _uiSetHighlighted:function(v) {
            var self = this,el = this.get("el");
            if (v) {
                el.addClass(self.getCls(HIGHLIGHTED_CLS));
            } else {
                el.removeClass(self.getCls(HIGHLIGHTED_CLS));
            }
        },

        _uiSetSelected:function(v) {
            var self = this,el = self.get("el");
            el[v ? "addClass" : "removeClass"](self.getCls(SELECTED_CLS));
        },

        _uiSetChecked:function(v) {
            var self = this,el = self.get("el");
            el[v ? "addClass" : "removeClass"](self.getCls(CHECKED_CLS));
            v && setUpCheckEl(self);
        },

        _uiSetSelectable:function(v) {
            this.get("el").attr("role", v ? 'menuitemradio' : 'menuitem');
        },

        _uiSetCheckable:function(v) {
            this.get("el").attr("role", v ? 'menuitemcheckbox' : 'menuitem');
        },

        _handleMouseDown:function() {
            var self = this,el = this.get("el");
            el.addClass(self.getCls(ACTIVE_CLS));
            el.attr("aria-pressed", true);
        },

        _handleMouseUp:function() {
            var self = this,el = this.get("el");
            el.removeClass(self.getCls(ACTIVE_CLS));
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