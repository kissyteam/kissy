/**
 * represent a menu option , just make it selectable and can have select status
 * @author yiminghe@gmail.com
 */
KISSY.add("menubutton/option", function(S, UIBase, Menu) {
    var MenuItem = Menu.Item;
    return UIBase.create(MenuItem, {
    }, {
        ATTRS:{
            selectable:{
                value:true
            }
        }
    });


}, {
    requires:['uibase','menu']
});