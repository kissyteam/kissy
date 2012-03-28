/**
 * @fileOverview menu item ,child component for menu
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/menuitem", function (S, UIBase, Component, MenuItemRender) {

    var $ = S.all;

    var MenuItem = UIBase.create(Component.Controller, [UIBase.ContentBox], {

        _handleMouseEnter:function (e) {
            // 父亲不允许自己处理
            if (MenuItem.superclass._handleMouseEnter.call(this, e)) {
                return true;
            }
            this.get("parent").set("highlightedItem", this);
        },

        _handleMouseLeave:function (e) {
            // 父亲不允许自己处理
            if (MenuItem.superclass._handleMouseLeave.call(this, e)) {
                return true;
            }
            this.get("parent").set("highlightedItem", undefined);
        },

        _performInternal:function () {
            var self = this;
            // 可选
            if (self.get("selectable")) {
                self.set("selected", true);
            }
            // 可选中，取消选中
            if (self.get("checkable")) {
                self.set("checked", !self.get("checked"));
            }
            self.get("parent").fire("click", {
                // 使用熟悉的 target，而不是自造新词！
                target:self
            });
            return true;
        },

        _uiSetChecked:function (v) {
            this._forwardSetAttrToView("checked", v);
        },

        _uiSetSelected:function (v) {
            this._forwardSetAttrToView("selected", v);
        },

        _uiSetHighlighted:function (v) {
            MenuItem.superclass._uiSetHighlighted.apply(this, arguments);
            // 是否要滚动到当前菜单项(横向，纵向)
            if (v) {
                var el = this.get("el"),
                    // 找到向上路径上第一个可以滚动的容器，直到父组件节点（包括）
                    // 找不到就放弃，为效率考虑不考虑 parent 的嵌套可滚动 div
                    p = el.parent(function (e) {
                        return $(e).css("overflow") != "visible";
                    }, this.get("parent").get("el").parent());
                if (!p) {
                    return;
                }
                el.scrollIntoView(p, undefined, undefined, true);
            }
        },

        containsElement:function (element) {
            return this.get('view') && this.get('view').containsElement(element);
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

            visibleMode:{
                value:"display"
            },

            /**
             * 是否绑定鼠标事件
             * @override
             */
            handleMouseEvents:{
                value:false
            },

            selectable:{
                view:true
            },

            checkable:{
                view:true
            },

            // @inheritedDoc
            // option.text
            // content:{},

            // option.value
            value:{},

            checked:{},
            selected:{}
        },

        HTML_PARSER:{
            selectable:function (el) {
                var cls = this.getCls("menuitem-selectable");
                return el.hasClass(cls);
            }
        }
    });

    MenuItem.DefaultRender = MenuItemRender;

    Component.UIStore.setUIByClass("menuitem", {
        priority:Component.UIStore.PRIORITY.LEVEL1,
        ui:MenuItem
    });

    return MenuItem;
}, {
    requires:['uibase', 'component', './menuitemrender']
});