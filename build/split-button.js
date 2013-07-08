/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 3 13:58
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 split-button
*/

/**
 * SplitButton for KISSY. Combination of button and menubutton.
 * @author yiminghe@gmail.com
 */
KISSY.add("split-button", function (S, Container) {

    return Container.extend({

        renderUI: function () {
            var self = this,
                alignWithEl = self.get("alignWithEl"),
                menuButton = self.get("children")[1],
                menu = menuButton.get("menu");
            if (alignWithEl) {
                menu.get("align").node = self.$el;
            }
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
            menuButton: {
                getter: function () {
                    return this.get('children')[1];
                },
                setter: function (v) {
                    this.get('children')[1] = v;
                }
            },
            button: {
                getter: function () {
                    return this.get('children')[0];
                },
                setter: function (v) {
                    this.get('children')[0] = v;
                }
            }
        },
        xclass: 'split-button'
    });


}, {
    requires: ['component/container',
        // implicit requirement
        'button', 'menubutton']
});

