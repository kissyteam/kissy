/**
 * simple menuitem render
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/menuitemrender", function(S, UIBase, Component) {


    var HIGHLIGHTED_CLS = "{prefixCls}menuitem-highlight",
        SELECTED_CLS = "{prefixCls}menuitem-selected",
        CHECKED_CLS = "{prefixCls}menuitem-checked",
        ACTIVE_CLS = "{prefixCls}menuitem-active",
        CONTENT_CLS = "{prefixCls}menuitem-content",
        EL_CLS = "{prefixCls}menuitem",
        DISABLED_CLS = "{prefixCls}menuitem-disabled";

    function getCls(self, str) {
        return S.substitute(str, {
            prefixCls:self.get("prefixCls")
        });
    }

    return UIBase.create(Component.Render, {
        renderUI:function() {
            var self = this,el = self.get("el");
            el.addClass(getCls(self, EL_CLS))
                .html("<div class='" + getCls(self, CONTENT_CLS) + "'>")
                .attr("role", "menuitem")
                .unselectable();
            if (!el.attr("id")) {
                el.attr("id", S.guid("ks-menuitem"));
            }
        },

        _uiSetContent:function(v) {
            var cs = this.get("el").children("div");
            cs.item(cs.length - 1).html(v);
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
            if (v) {
                this.get("el").addClass(getCls(this, HIGHLIGHTED_CLS));
            } else {
                this.get("el").removeClass(getCls(this, HIGHLIGHTED_CLS));
            }
        },

        _uiSetSelected:function(v) {
            var el = this.get("el");
            el[v ? "addClass" : "removeClass"](getCls(this, SELECTED_CLS));
        },

        _uiSetChecked:function(v) {
            var el = this.get("el");
            el[v ? "addClass" : "removeClass"](getCls(this, CHECKED_CLS));
        },

        _uiSetSelectable:function(v) {
            this.get("el").attr("role", v ? 'menuitemradio' : 'menuitem');
        },

        _uiSetCheckable:function(v) {
            this.get("el").attr("role", v ? 'menuitemcheckbox' : 'menuitem');
        },

        _handleMouseDown:function() {
            this.get("el").addClass(getCls(this, ACTIVE_CLS));
            this.get("el").attr("aria-pressed", true);
        },

        _handleMouseUp:function() {
            this.get("el").removeClass(getCls(this, ACTIVE_CLS));
            this.get("el").attr("aria-pressed", false);
        }
    }, {
        ATTRS:{
            highlighted:{},
            selected:{},
            content:{}
        },
        HTML_PARSER:{
            content:function(el) {
                return el.html();
            }
        }
    });
}, {
    requires:['uibase','component']
});