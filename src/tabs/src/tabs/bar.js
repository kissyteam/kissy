/**
 * @ignore
 * TabBar for KISSY.
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Toolbar = require('toolbar');
    var BarRender = require('./bar-render');
    /**
     * tab bar container for tab tabs.xclass: 'tabs-bar'.
     * @class  KISSY.Tabs.Bar
     * @extends KISSY.Toolbar
     */
    var TabBar = Toolbar.extend({
        bindUI: function () {
            var self = this;
            self.on('afterSelectedChange', function (e) {
                if (e.newVal && e.target.isTabsTab) {
                    self.set('selectedTab', e.target);
                }
            });
        },

        syncUI: function () {
            var bar = this,
                children = bar.get('children');
            S.each(children, function (c) {
                if (c.get('selected')) {
                    bar.setInternal('selectedTab', c);
                    return false;
                }
                return undefined;
            });
        },

        handleKeyDownInternal: function (e) {
            var self = this;
            var current = self.get('selectedTab');
            var next = self.getNextItemByKeyDown(e, current);
            if (typeof next === 'boolean') {
                return next;
            } else {
                next.set('selected', true);
                return true;
            }
        },

        _onSetSelectedTab: function (v, e) {
            var prev;
            if (v) {
                if (e && (prev = e.prevVal)) {
                    prev.set('selected', false);
                }
                v.set('selected', true);
            }
        },

        _onSetHighlightedItem: function (v, e) {
            var self = this;
            self.callSuper(v, e);
            if (self.get('changeType') === 'mouse') {
                self._onSetSelectedTab.apply(self, arguments);
            }
        }

    }, {
        ATTRS: {
            selectedTab: {
            },
            changeType: {
                value: 'click'
            },
            defaultChildCfg: {
                value: {
                    xclass: 'tabs-tab'
                }
            },
            xrender: {
                value: BarRender
            }
        },
        xclass: 'tabs-bar'
    });

    /**
     * tabs change type
     * @enum {String}  KISSY.Tabs.ChangeType
     */
    TabBar.ChangeType = {
        /**
         * click
         */
        CLICK: 'click',
        /**
         * mouse
         */
        MOUSE: 'mouse'
    };

    return TabBar;
});