/**
 * @ignore
 * render aria from menu according to current menuitem
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/menu-render", function (S, Container) {

    return Container.ATTRS.xrender.value.extend({

        beforeCreateDom: function (renderData) {
            renderData.elAttrs.role = 'menu';
        },

        setAriaActiveDescendant: function (v) {
            var el = this.el;
            if (v) {
                var menuItemEl = v.el,
                    id = menuItemEl.attr("id");
                el.attr("aria-activedescendant", id);
                // 会打印重复 ，每个子菜单都会打印，然后冒泡至父菜单，再打印，和该 menuitem 所处层次有关系
            } else {
                el.attr("aria-activedescendant", "");
            }
        },

        containsElement: function (element) {
            var el = this.el;
            return el && (el[0] === element || el.contains(element));
        }
    });
}, {
    requires: ['component/container']
});