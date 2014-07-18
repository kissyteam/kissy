/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 13:52
*/
/*
combined modules:
button
*/
KISSY.add('button', [
    'node',
    'component/control'
], function (S, require, exports, module) {
    /**
 * @ignore
 * Button control for KISSY.
 * @author yiminghe@gmail.com
 */
    var $ = require('node');
    var Control = require('component/control');
    var KeyCode = $.Event.KeyCode;    /**
 * KISSY Button.
 * @extends KISSY.Component.Control
 * @class KISSY.Button
 */
    /**
 * KISSY Button.
 * @extends KISSY.Component.Control
 * @class KISSY.Button
 */
    module.exports = Control.extend({
        isButton: 1,
        beforeCreateDom: function (renderData) {
            var self = this;
            var elAttrs = renderData.elAttrs;
            elAttrs.role = 'button';
            if (renderData.tooltip) {
                elAttrs.title = renderData.tooltip;
            }
            if (renderData['aria-describedby']) {
                elAttrs['aria-describedby'] = renderData.describedby;
            }
            if (renderData.checked) {
                renderData.elCls.push(self.getBaseCssClasses('checked'));
            }
        },
        bindUI: function () {
            this.$el.on('keyup', this.handleKeyDownInternal, this);
        },
        handleKeyDownInternal: function (e) {
            if (e.keyCode === KeyCode.ENTER && e.type === 'keydown' || e.keyCode === KeyCode.SPACE && e.type === 'keyup') {
                return this.handleClickInternal(e);
            }    // Return true for space keypress (even though the event is handled on keyup)
                 // as preventDefault needs to be called up keypress to take effect in IE and
                 // WebKit.
            // Return true for space keypress (even though the event is handled on keyup)
            // as preventDefault needs to be called up keypress to take effect in IE and
            // WebKit.
            return e.keyCode === KeyCode.SPACE;
        },
        handleClickInternal: function () {
            var self = this;
            self.callSuper();
            if (self.get('checkable')) {
                self.set('checked', !self.get('checked'));
            }    // button 的默认行为就是触发 click
            // button 的默认行为就是触发 click
            self.fire('click');
        },
        _onSetChecked: function (v) {
            var self = this, cls = self.getBaseCssClasses('checked');
            self.$el[v ? 'addClass' : 'removeClass'](cls);
        },
        _onSetTooltip: function (title) {
            this.el.setAttribute('title', title);
        },
        _onSetDescribedby: function (describedby) {
            this.el.setAttribute('aria-describedby', describedby);
        }
    }, {
        ATTRS: {
            handleGestureEvents: { value: true },
            focusable: { value: true },
            allowTextSelection: { value: false },
            /**
         * Value associated with button component.
         * @property value
         */
            /**
         * Value associated with button component.
         * @cfg {*} value
         */
            /**
         * @ignore
         */
            value: {},
            /**
         *Aria-describedby attribute.
         * @property describedby
         * @type {String}
         */
            /**
         *Aria-describedby attribute.
         * @cfg {String} describedby
         */
            /**
         * @ignore
         */
            describedby: {
                value: '',
                render: 1,
                sync: 0
            },
            /**
         * Tooltip for button.
         * @cfg {String} tooltip
         */
            /**
         * Tooltip for button.
         * @property tooltip
         * @type {String}
         */
            /**
         * @ignore
         */
            tooltip: {
                value: '',
                render: 1,
                sync: 0
            },
            /**
         * Whether button can be checkable(toggle).
         * Defaults to: false.
         * @cfg {Boolean} checkable
         */
            /**
         * @ignore
         */
            checkable: {},
            /**
         * Whether button is checked(toggle).
         * Defaults to: false.
         * @type {Boolean}
         * @property checked
         */
            /**
         * Whether button is checked(toggle).
         * @cfg {Boolean} checked
         */
            /**
         * @ignore
         */
            checked: {
                value: false,
                render: 1,
                sync: 0
            }
        },
        xclass: 'button'
    });
});

