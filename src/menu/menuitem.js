/**
 * menu item ,child component for menu
 * @author:yiminghe@gmail.com
 */
KISSY.add("menu/menuitem", function(S, UIBase, Component) {
    var MenuItem = UIBase.create(Component.ModelControl, [], {
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

        _handleClick:function() {
            if (MenuItem.superclass._handleClick.call(this) === false) return false;
            this.set("selected", true);
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

    return MenuItem;
}, {
    requires:['uibase','component']
});