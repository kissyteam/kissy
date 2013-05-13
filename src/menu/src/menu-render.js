/**
 * @ignore
 * render aria from menu according to current menuitem
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/menu-render", function (S, Component) {

    return Component.Render.extend({

        initializer: function () {
            this.get('elAttrs')['role']='menu';
        },

        setAriaActiveDescendant: function (v) {
            var el = this.get("el");
            if (v) {
                var menuItemEl = v.get("el"),
                    id = menuItemEl.attr("id");
                el.attr("aria-activedescendant", id);
                // 会打印重复 ，每个子菜单都会打印，然后冒泡至父菜单，再打印，和该 menuitem 所处层次有关系
            } else {
                el.attr("aria-activedescendant", "");
            }
        },

        containsElement: function (element) {
            var el = this.get("el");
            return el[0] === element || el.contains(element);
        }
    });
}, {
    requires: ['component/base']
});