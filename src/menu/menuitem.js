/**
 * menu item ,child component for menu
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/menuitem", function(S, UIBase, Component, MenuItemRender) {
    var MenuItem = UIBase.create(Component.ModelControl, {

        _handleMouseEnter:function() {
            if (MenuItem.superclass._handleMouseEnter.call(this) === false) {
                return false;
            }
            this.get("parent").set("highlightedItem", this);
        },

        _handleMouseLeave:function() {
            if (MenuItem.superclass._handleMouseLeave.call(this) === false) {
                return false;
            }
            this.get("parent").set("highlightedItem", null);
        },

        _handleClick:function() {
            if (MenuItem.superclass._handleClick.call(this) === false) {
                return false;
            }
            this.get("parent").set("selectedItem", this);
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