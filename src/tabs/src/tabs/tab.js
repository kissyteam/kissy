/**
 * @ignore
 * Single tab in tab bar.
 * @author yiminghe@gmail.com
 */

var Button = require('button');
var TabTpl = require('./tab-xtpl');
var ContentBox = require('component/extension/content-box');

function close() {
    this.fire('afterTabClose');
}

/**
 * KISSY.Tabs.Tab. xclass:'tabs-tab'
 * @class KISSY.Tabs.Tab
 * @extends KISSY.Button
 */
module.exports = Button.extend([ContentBox], {
    initializer: function () {
        this.publish('beforeTabClose', {
            defaultFn: close,
            defaultTargetOnly: true
        });
    },

    isTabsTab: true,

    beforeCreateDom: function (renderData) {
        var attrs = renderData.elAttrs;
        attrs.role = 'tab';
        if (renderData.selected) {
            attrs['aria-selected'] = true;
            renderData.elCls.push(this.getBaseCssClasses('selected'));
        }
        if (renderData.closable) {
            renderData.elCls.push(this.getBaseCssClasses('closable'));
        }
    },

    handleClickInternal: function (e) {
        var self = this;
        if (self.get('closable')) {
            if (e.target === self.get('closeBtn')[0]) {
                self.fire('beforeTabClose');
                return;
            }
        }
        self.callSuper(e);
        self.set('selected', true);
    },

    _onSetSelected: function (v) {
        var el = this.$el;
        var selectedCls = this.getBaseCssClasses('selected');
        el[v ? 'addClass' : 'removeClass'](selectedCls)
            .attr('aria-selected', !!v);
    }
}, {
    ATTRS: {
        contentTpl: {
            value: TabTpl
        },
        handleGestureEvents: {
            value: false
        },
        focusable: {
            value: false
        },
        /**
         * whether closable
         * @cfg {Boolean} closable
         */
        /**
         * @ignore
         */
        closable: {
            value: false,
            render: 1,
            sync: 0,
            parse: function () {
                return !!this.get('closeBtn');
            }
        },
        closeBtn: {
            selector: function () {
                return '.' + this.getBaseCssClass('close');
            }
        },
        /**
         * whether selected
         * @cfg {Boolean} selected
         */
        /**
         * @ignore
         */
        selected: {
            render: 1,
            sync: 0,
            parse: function (el) {
                return el.hasClass(this.getBaseCssClass('selected'));
            }
        }
    },
    xclass: 'tabs-tab'
});