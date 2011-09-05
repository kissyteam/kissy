/**
 * menu item ,child component for menu
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/menuitem", function(S, UIBase, Component, MenuItemRender) {
    var MenuItem = UIBase.create(Component.ModelControl, [UIBase.Contentbox], {

        _handleMouseEnter:function(e) {
            // 父亲不允许自己处理
            if (MenuItem.superclass._handleMouseEnter.call(this, e)) {
                return true;
            }
            this.get("parent").set("highlightedItem", this);
        },

        _handleMouseLeave:function(e) {
            // 父亲不允许自己处理
            if (MenuItem.superclass._handleMouseLeave.call(this, e)) {
                return true;
            }
            this.get("parent").set("highlightedItem", undefined);
        },

        _performInternal:function() {
            // 可选
            if (this.get("selectable")) {
                this.set("selected", true);
            }
            // 可选中，取消选中
            if (this.get("checkable")) {
                this.set("checked", !this.get("checked"));
            }
            this.get("parent").fire("click", {
                // 使用熟悉的 target，而不是自造新词！
                target:this
            });
            return true;
        },

        _uiSetChecked:function(v) {
            this._forwardSetAttrToView("checked", v);
        },

        _uiSetSelected:function(v) {
            this._forwardSetAttrToView("selected", v);
        },

        _uiSetHighlighted:function(v) {
            MenuItem.superclass._uiSetHighlighted.apply(this, arguments);
            // 是否要滚动到当前菜单项
            if (v) {
                var el = this.get("el"),
                    p = this.get("parent").get("el"),
                    y = el.offset().top,
                    h = el[0].offsetHeight,
                    py = p.offset().top,
                    ph = p[0].offsetHeight;
                S.log(y - py);
                S.log(ph);
                // 会有一点误差？？
                if (y - py >= ph || Math.abs(y - py - ph) < 5) {
                    // 利用系统提供的滚动，效率高点？
                    el[0].scrollIntoView(false);
                    //p[0].scrollTop += y - py + h - ph;
                } else if (y - py < 0) {
                    el[0].scrollIntoView(true);
                    //p[0].scrollTop += y - py;
                }
            }
        },

        containsElement:function(element) {
            return this.get('view').containsElement(element);
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
            selectable:function(el) {
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
    requires:['uibase','component','./menuitemrender']
});