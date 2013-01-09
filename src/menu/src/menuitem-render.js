/**
 * @ignore
 * simple menuitem render
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/menuitem-render", function (S, Node, Component, undefined) {

    var CHECK_CLS = "menuitem-checkbox";

    function setUpCheckEl(self) {
        var el = self.get("el"),
            prefixCls = self.get('prefixCls'),
            checkEl = el.one("." + prefixCls + CHECK_CLS);
        if (!checkEl) {
            checkEl = new Node("<div class='" + prefixCls + CHECK_CLS + "'/>")
                .prependTo(el);
            // if not ie will lose focus when click
            checkEl.unselectable(/**
             @type HTMLElement
             @ignore
             */undefined);
        }
        return checkEl;
    }

    return Component.Render.extend({

        _onSetChecked: function (v) {
            var self = this,
                el = self.get("el"),
                cls = self.getCssClassWithState("-checked");
            el[v ? 'addClass' : 'removeClass'](cls);
        },

        _onSetSelected: function (v) {
            var self = this,
                el = self.get("el"),
                cls = self.getCssClassWithState("-selected");
            el[v ? 'addClass' : 'removeClass'](cls);
        },

        '_onSetSelectable': function (v) {
            this.get("el").attr("role", v ? 'menuitemradio' : 'menuitem');
        },

        '_onSetCheckable': function (v) {
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
            // 属性必须声明，否则无法和 _onSetChecked 绑定在一起
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
    requires: ['node', 'component/base']
});