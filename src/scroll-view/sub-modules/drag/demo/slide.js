KISSY.add(function (S, Node, Base, ScrollView, XTemplate) {
    var $ = Node.all;
    var TRIGGER_TPL = '<div class="ks-scroll-view-slide-nav">' +
        '{{#each count}}' +
        '<div class="ks-scroll-view-slide-trigger' +
        '{{#if xindex===0}}' +
        ' ks-scroll-view-slide-trigger-active' +
        '{{/if}}' +
        '"></div>' +
        '{{/each}}' +
        '</div>';

    var ACTIVE_CLASS = 'ks-scroll-view-slide-trigger-active';

    return Base.extend({
        render: function () {
            var self = this,
                direction = self.get('direction'),
                srcNode = $(self.get('srcNode'));
            self.scrollView = new ScrollView({
                srcNode: srcNode,
                snap: true,
                lockX: direction == 'y',
                lockY: direction == 'x',
                bounce: self.get('bounce')
            }).render();
            self.content = self.scrollView.get('contentEl');
            if (self.get('hasTrigger')) {
                var childrenCount = self.content.children().length;
                self.nav = $(new XTemplate(TRIGGER_TPL).render({
                    count: new Array(childrenCount)
                })).appendTo(srcNode);
                self.triggers = self.nav.children();
                self.nav.delegate(Node.Gesture.tap,
                    '.ks-scroll-view-slide-trigger',
                    self._onTriggerAction, self);
                if (self.get('triggerType') == 'mouse') {
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
    requires: ['node', 'base', 'scroll-view', 'xtemplate']
});