/*
Copyright 2013, KISSY v1.40dev
MIT Licensed
build time: Sep 17 23:10
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 split-button
*/

/**
 * @ignore
 * SplitButton for KISSY. Combination of button and menubutton.
 * @author yiminghe@gmail.com
 */
KISSY.add("split-button", function (S, Container) {
    /**
     * split button container for menubutton and button
     * @class KISSY.SplitButton
     * @extend KISSY.Component.Container
     */
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
            /**
             * whether align menubutton with button.
             * Defaults to: true
             * @cfg {Boolean} alignWithEl
             */
            /**
             * @ignore
             */
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
            /**
             * menubutton component
             * @cfg {KISSY.MenuButton} menuButton
             */

            /**
             * menubutton component
             * @property {KISSY.MenuButton} menuButton
             */

            /**
             * @ignore
             */
            menuButton: {
                getter: function () {
                    return this.get('children')[1];
                },
                setter: function (v) {
                    this.get('children')[1] = v;
                }
            },

            /**
             * button component
             * @cfg {KISSY.Button} button
             */

            /**
             * button component
             * @property {KISSY.Button} button
             */

            /**
             * @ignore
             */
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

