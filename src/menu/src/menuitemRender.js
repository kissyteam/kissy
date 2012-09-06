/**
 * @fileOverview simple menuitem render
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/menuitemRender", function (S, Node, Component) {

    var CHECK_CLS = "ks-menuitem-checkbox";

    function setUpCheckEl(self) {
        var el = self.get("el"),
            checkEl = el.one("." + CHECK_CLS);
        if (!checkEl) {
            checkEl = new Node("<div class='" + CHECK_CLS + "'/>")
                .prependTo(el);
            // if not ie will lose focus when click
            checkEl.unselectable();
        }
        return checkEl;
    }

    return Component.Render.extend({

        _uiSetChecked: function (v) {
            var self = this,
                el = self.get("el"),
                cls = self.getComponentCssClassWithState("-checked");
            el[v ? 'addClass' : 'removeClass'](cls);
        },

        _uiSetSelected: function (v) {
            var self = this,
                el = self.get("el"),
                cls = self.getComponentCssClassWithState("-selected");
            el[v ? 'addClass' : 'removeClass'](cls);
        },

        _uiSetSelectable: function (v) {
            this.get("el").attr("role", v ? 'menuitemradio' : 'menuitem');
        },

        _uiSetCheckable: function (v) {
            if (v) {
                setUpCheckEl(this);
            }
            this.get("el").attr("role", v ? 'menuitemcheckbox' : 'menuitem');
        },

        containsElement: function (element) {
            var el = this.get("el");
            return el && ( el[0] == element || el.contains(element));
        }
    }, {
        ATTRS: {
            checkable: {},
            elAttrs: {
                valueFn: function () {
                    return {
                        role: "menuitem",
                        id: S.guid("ks-menuitem")
                    };
                }
            },
            selected: {},
            // @inheritedDoc
            // content:{},
            // 属性必须声明，否则无法和 _uiSetChecked 绑定在一起
            checked: {}
        },
        HTML_PARSER: {
            selectable: function (el) {
                var cls = this.getCssClassWithPrefix("menuitem-selectable");
                return el.hasClass(cls);
            },
            checkable: function (el) {
                var cls = this.getCssClassWithPrefix("menuitem-checkable");
                return el.hasClass(cls);
            }
        }
    });
}, {
    requires: ['node', 'component']
});