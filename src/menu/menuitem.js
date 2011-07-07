/**
 * menu item ,child component for menu
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/menuitem", function(S, UIBase, Component, MenuItemRender) {
    var MenuItem = UIBase.create(Component.ModelControl, {

        _handleMouseEnter:function(e) {
            if (MenuItem.superclass._handleMouseEnter.call(this,e) === true) {
                return true;
            }
            this.get("parent").set("highlightedItem", this);
        },

        _handleMouseLeave:function(e) {
            if (MenuItem.superclass._handleMouseLeave.call(this,e) === true) {
                return true;
            }
            this.get("parent").set("highlightedItem", null);
        },

        _handleClick:function(e) {
            if (MenuItem.superclass._handleClick.call(this,e) === true) {
                return true;
            }
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
        },

        _uiSetHighlighted:function(v) {
            this.get("view").set("highlighted", v);

            // 是否要滚动到当前菜单项
            if (v) {
                var el = this.get("el"),
                    p = this.get("parent").get("el"),
                    y = el.offset().top,
                    h = el[0].offsetHeight,
                    py = p.offset().top,
                    ph = p[0].offsetHeight;
                if (y - py >= ph) {
                    p[0].scrollTop += y - py + h - ph;
                } else if (y - py < 0) {
                    p[0].scrollTop += y - py;
                }
            }
        }

    }, {
        ATTRS:{


            /**
             * 是否绑定鼠标事件
             * @override
             */
            handleMouseEvents:{
                value:false
            },

            /**
             * 是否支持焦点处理
             * @override
             */
            supportFocused:{
                value:false
            },

            selectable:{
                value:false,
                view:true
            },

            checkable:{
                value:false,
                view:true
            },

            // option.text
            content:{
                view:true,
                valueFn:function() {
                    return this.get("view") && this.get("view").get("content");
                }
            },

            // option.value
            value:{},
            highlighted:{
                view:true,
                value:false
            },
            checked:{
                value:false,
                view:true
            },
            selected:{
                view:true,
                value:false
            }
        }
    });

    MenuItem.DefaultRender = MenuItemRender;

    return MenuItem;
}, {
    requires:['uibase','component','./menuitemrender']
});