/**
 * menu item ,child component for menu
 * @author:yiminghe@gmail.com
 */
KISSY.add("menu/menuitem", function(S, UIBase, Component, MenuItemRender) {
    var MenuItem = UIBase.create(Component.ModelControl, {

        _handleMouseEnter:function() {
            if (MenuItem.superclass._handleMouseEnter.call(this) === false) return false;
            this.set("highlighted", true);
        },

        _handleMouseLeave:function() {
            if (MenuItem.superclass._handleMouseLeave.call(this) === false) return false;
            this.set("highlighted", false);
        },

        _handleClickInternal:function() {
            this.set("selected", true);
            this.fire("menuItemSelected");
        },
        _handleClick:function() {
            if (MenuItem.superclass._handleClick.call(this) === false) return false;
            this._handleClickInternal.apply(this, arguments);
        }
    }, {
        ATTRS:{
            content:{
                view:true
            },
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