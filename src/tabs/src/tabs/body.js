/**
 * @ignore
 * Body for tab panels.
 * @author yiminghe@gmail.com
 */
var Container = require('component/container');
var util = require('util');
/**
 * tab body container for tab panels.xclass: 'tabs-body'.
 * @class  KISSY.Tabs.Body
 * @extends KISSY.Component.Container
 */
var TabBody = Container.extend({
    bindUI: function () {
        var self = this;
        self.on('afterSelectedPanelIndexChange', function (e) {
            var children = self.get('children'),
                newIndex = e.newVal,
                hidePanel;
            if (children[newIndex]) {
                if ((hidePanel = children[e.prevVal])) {
                    hidePanel.set('selected', false);
                }
                self.selectPanelByIndex(newIndex);
            }
        });
    },

    syncUI: function () {
        var self = this,
            children = self.get('children');
        util.each(children, function (c, i) {
            if (c.get('selected')) {
                self.set('selectedPanelIndex', i);
                return false;
            }
            return undefined;
        });
    },

    createChild: function (index) {
        return checkLazy(this, 'createChild', index);
    },

    renderChild: function (index) {
        return checkLazy(this, 'renderChild', index);
    },

    selectPanelByIndex: function (newIndex) {
        this.get('children')[newIndex].set('selected', true);
        if (this.get('lazyRender')) {
            // lazy render
            this.renderChild(newIndex);
        }
    }
}, {
    ATTRS: {
        allowTextSelection: {
            value: true
        },

        focusable: {
            value: false
        },

        handleGestureEvents: {
            value: false
        },

        selectedPanelIndex: {
        },

        lazyRender: {
        },

        defaultChildCfg: {
            valueFn: function () {
                return {
                    xclass: 'tabs-panel'
                };
            }
        }
    },
    xclass: 'tabs-body'
});

function checkLazy(self, method, index) {
    if (self.get('lazyRender')) {
        var c = self.get('children')[index];
        if (!c.get('selected')) {
            return c;
        }
    }
    return TabBody.superclass[method].call(self, index);
}

module.exports = TabBody;