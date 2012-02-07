/**
 * @fileOverview simple menuitem render
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/menuitemrender", function (S, Node, UIBase, Component) {

    var CHECK_CLS = "menuitem-checkbox",
        CONTENT_CLS = "menuitem-content";

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

    return UIBase.create(Component.Render, [UIBase.ContentBox.Render], {

        _setSelected:function (v, componentCls) {
            var self = this,
                tag = "-selected",
                el = self.get("el"),
                cls = self._completeClasses(componentCls, tag);
            el[v ? 'addClass' : 'removeClass'](cls);
        },

        _setChecked:function (v, componentCls) {
            var self = this,
                tag = "-checked",
                el = self.get("el"),
                cls = self._completeClasses(componentCls, tag);
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
            contentElCls:{
                valueFn:function () {
                    return this.getCls(CONTENT_CLS);
                }
            },
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
    });
}, {
    requires:['node', 'uibase', 'component']
});