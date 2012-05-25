/**
 * @fileOverview simple menuitem render
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/menuitemRender", function (S, Node, UIBase, Component) {

    var CHECK_CLS = "menuitem-checkbox";

    function setUpCheckEl(self) {
        var el = self.get("el"),
            cls = self.getCssClassWithPrefix(CHECK_CLS),
            checkEl = el.one("." + cls);
        if (!checkEl) {
            checkEl = new Node("<div class='" + cls + "'/>").prependTo(el);
            // if not ie will lose focus when click
            checkEl.unselectable();
        }
        return checkEl;
    }

    return UIBase.create(Component.Render, {

        _uiSetChecked:function (v) {
            var self = this,
                el = self.get("el"),
                cls = self.getComponentCssClassWithState("-checked");
            el[v ? 'addClass' : 'removeClass'](cls);
        },

        _uiSetSelected:function (v) {
            var self = this,
                el = self.get("el"),
                cls = self.getComponentCssClassWithState("-selected");
            el[v ? 'addClass' : 'removeClass'](cls);
        },

        _uiSetSelectable:function (v) {
            this.get("el").attr("role", v ? 'menuitemradio' : 'menuitem');
        },

        _uiSetCheckable:function (v) {
            if (v) {
                setUpCheckEl(this);
            }
            this.get("el").attr("role", v ? 'menuitemcheckbox' : 'menuitem');
        },

        containsElement:function (element) {
            var el = this.get("el");
            return el[0] == element || el.contains(element);
        }
    }, {
        ATTRS:{
            elAttrs:{
                valueFn:function () {
                    return {
                        role:"menuitem",
                        id:S.guid("ks-menuitem")
                    };
                }
            },
            selected:{},
            // @inheritedDoc
            // content:{},
            // 属性必须声明，否则无法和 _uiSetChecked 绑定在一起
            checked:{}
        }
    }, "Menu_Item_Render");
}, {
    requires:['node', 'uibase', 'component']
});