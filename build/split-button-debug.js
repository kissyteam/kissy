/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 14:05
*/
/*
combined modules:
split-button
*/
KISSY.add('split-button', [
    'component/container',
    'button',
    'menubutton'
], function (S, require, exports, module) {
    /**
 * @ignore
 * SplitButton for KISSY. Combination of button and menubutton.
 * @author yiminghe@gmail.com
 */
    var Container = require('component/container');
    require('button');
    require('menubutton');    /**
 * split button container for menubutton and button
 * @class KISSY.SplitButton
 * @extend KISSY.Component.Container
 */
    /**
 * split button container for menubutton and button
 * @class KISSY.SplitButton
 * @extend KISSY.Component.Container
 */
    module.exports = Container.extend({
        renderUI: function () {
            var self = this, alignWithEl = self.get('alignWithEl'), menuButton = self.get('children')[1], menu = menuButton.get('menu');
            if (alignWithEl) {
                menu.get('align').node = self.$el;
            }
        }
    }, {
        ATTRS: {
            handleGestureEvents: { value: false },
            focusable: { value: false },
            allowTextSelection: { value: true },
            /**
         * whether align menubutton with button.
         * Defaults to: true
         * @cfg {Boolean} alignWithEl
         */
            /**
         * @ignore
         */
            alignWithEl: { value: true },
            children: {
                value: [
                    { xclass: 'button' },
                    { xclass: 'menu-button' }
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
});


