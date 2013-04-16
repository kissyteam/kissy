/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:23
*/
/**
 * SplitButton for KISSY. Combination of button and menubutton.
 * @author yiminghe@gmail.com
 */
KISSY.add("split-button", function (S, Component, Button, MenuButton) {

    return Component.Controller.extend([], {

        renderUI: function () {
            var self = this,
                alignWithEl = self.get("alignWithEl"),
                children = self.get("children");
            self.setInternal("menuButton", children[1]);
            self.setInternal("button", children[0]);
            var menuButton = children[1],
                menu = menuButton.get("menu");
            if (alignWithEl) {
                if (menu.isController) {
                    menu.get("align").node = self.get("el");
                } else {
                    menu.align = menu.align || {};
                    menu.align.node = self.get("el");
                }
            }
        },

        decorateInternal: function (el) {
            var self = this,
                button = self.get("button"),
                menuButton = self.get("menuButton");
            self.set("el", el);
            var children = el.children();
            self.setInternal("button", new Button(S.mix({
                srcNode: children[0]
            }, button)));
            self.setInternal("menuButton", new MenuButton(S.mix({
                srcNode: children[1]
            }, menuButton)));
        }

    }, {

        ATTRS: {
            handleMouseEvents: {
                value: false
            },
            focusable: {
                value: false
            },
            alignWithEl: {
                value: true
            },
            children: {
                value: [
                    {
                        xclass: 'button'
                    },
                    {
                        xclass: 'menu-button'
                    }
                ]
            },
            button: {
                setter: function (v) {
                    this.get("children")[0] = v;
                }
            },
            menuButton: {
                setter: function (v) {
                    this.get("children")[1] = v;
                }
            }
        }

    }, {
        xclass: 'split-button'
    });


}, {
    requires: ['component/base', 'button', 'menubutton']
});
