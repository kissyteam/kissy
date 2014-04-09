/**
 * simple slide using scroll-view
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, Node, Base, ScrollView) {
    var $ = Node.all;

    var TapGesture = require('event/gesture/tap');
    var tap = TapGesture.TAP;

    var ACTIVE_CLASS = 'ks-scroll-view-slide-trigger-active';

    function buildTriggerTpl(count) {
        var tpl = '<div class="ks-scroll-view-slide-nav">';
        for (var i = 0; i < count; i++) {
            tpl += '<div class="ks-scroll-view-slide-trigger' +
                (i === 0 ? ' ks-scroll-view-slide-trigger-active' : '') +
                '"></div>';
        }
        tpl += '</div>';
        return tpl;
    }

    return Base.extend({
        render: function () {
            var self = this,
                direction = self.get('direction'),
                srcNode = $(self.get('srcNode'));
            self.scrollView = new ScrollView({
                srcNode: srcNode,
                snap: true,
                lockX: direction === 'y',
                lockY: direction === 'x',
                bounce: self.get('bounce')
            }).render();
            self.content = self.scrollView.get('contentEl');
            if (self.get('hasTrigger')) {
                var childrenCount = self.content.children().length;
                self.nav = $(buildTriggerTpl(childrenCount)).appendTo(srcNode);
                self.triggers = self.nav.children();
                self.nav.delegate(tap,
                    '.ks-scroll-view-slide-trigger',
                    self._onTriggerAction, self);
                if (self.get('triggerType') === 'mouse') {
                    self.nav.delegate('mouseenter',
                        '.ks-scroll-view-slide-trigger',
                        self._onTriggerAction, self);
                }
                self.scrollView.on('afterPageIndexChange', self._onPageIndexChange, self);
            }
            return self;
        },

        _onPageIndexChange: function (e) {
            var self = this;
            self.triggers.item(e.prevVal).removeClass(ACTIVE_CLASS);
            self.triggers.item(e.newVal).addClass(ACTIVE_CLASS);
        },

        _onTriggerAction: function (e) {
            var trigger = $(e.currentTarget);
            var index = trigger.index();
            this.scrollView.scrollToPage(index, {
                easing: this.get('easing'),
                duration: this.get('duration')
            });
        }
    }, {
        ATTRS: {
            srcNode: {},
            bounce: {
                value: true
            },
            direction: {
                value: 'x'
            },
            easing: {
                value: 'easeNone'
            },
            hasTrigger: {
                value: true
            },
            duration: {
                value: 0.5
            }
        }
    });
}, {
    requires: ['node', 'base', 'scroll-view']
});