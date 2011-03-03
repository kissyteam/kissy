/**
 * menu item ,child component for menu
 * @author:yiminghe@gmail.com
 */
KISSY.add("menu/menuitem", function(S, UIBase, Component, MenuItemRender) {
    var MenuItem = UIBase.create(Component.ModelControl,{
        _uiSetHighlighted:function(v) {
            this.get("view").set("highlighted", v);
        },
        _uiSetSelected:function(v) {
            this.get("view").set("selected", v);
        },
        _uiSetContent:function(v) {
            this.get("view").set("content", v);
        },

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
            content:{},
            highlighted:{
                value:false
            },
            selected:{
                value:false
            }
        }
    });

    MenuItem.DefaultRender = MenuItemRender;
    
    return MenuItem;
}, {
    requires:['uibase','component','./menuitemrender']
});