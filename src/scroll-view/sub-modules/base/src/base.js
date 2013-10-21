/**
 * @ignore
 * scroll-view control
 * @author yiminghe@gmail.com
 */
KISSY.add('scroll-view/base', function (S, Node, Anim, Container, Render, undefined) {
    var $ = S.all,
        isTouchEventSupported = S.Features.isTouchEventSupported(),
        KeyCode = Node.KeyCode;

    function onElScroll() {
        var self = this,
            el = self.el,
            scrollTop = el.scrollTop,
            scrollLeft = el.scrollLeft;
        if (scrollTop) {
            self.set('scrollTop', scrollTop + self.get('scrollTop'));
        }
        if (scrollLeft) {
            self.set('scrollLeft', scrollLeft + self.get('scrollLeft'));
        }
        el.scrollTop = el.scrollLeft = 0;
    }

    function frame(anim, fx) {
        anim.scrollView.set(fx.prop, fx.val);
    }

    /**
     * Make container scrollable
     * @class KISSY.ScrollView
     * @extend KISSY.Component.Container
     */
    return Container.extend({
        initializer: function () {
            this.scrollAnims = [];
        },

        bindUI: function () {
            var self = this,
                $el = self.$el;
            $el.on('mousewheel', self.handleMouseWheel, self)
                // textarea enter cause el to scroll
                // bug: left top scroll does not fire scroll event, because scrollTop is 0!
                .on('scroll', onElScroll, self);
        },

        handleKeyDownInternal: function (e) {
            // no need to process disabled (already processed by Component)
            var target = e.target,
                $target = $(target),
                nodeName = $target.nodeName();
            // editable element
            if (nodeName == 'input' ||
                nodeName == 'textarea' ||
                nodeName == 'select' ||
                $target.hasAttr('contenteditable')) {
                return undefined;
            }
            var self = this,
                keyCode = e.keyCode,
                scrollStep = self.getScrollStep(),
                ok = undefined;
            var allowX = self.allowScroll['left'];
            var allowY = self.allowScroll['top'];
            if (allowY) {
                var scrollStepY = scrollStep.top,
                    clientHeight = self.clientHeight,
                    scrollTop = self.get('scrollTop');
                if (keyCode == KeyCode.DOWN) {
                    self.scrollToWithBounds({
                        top: scrollTop + scrollStepY
                    });
                    ok = true;
                } else if (keyCode == KeyCode.UP) {
                    self.scrollToWithBounds({top: scrollTop - scrollStepY});
                    ok = true;
                } else if (keyCode == KeyCode.PAGE_DOWN) {
                    self.scrollToWithBounds({top: scrollTop + clientHeight});
                    ok = true;
                } else if (keyCode == KeyCode.PAGE_UP) {
                    self.scrollToWithBounds({top: scrollTop - clientHeight});
                    ok = true;
                }
            }
            if (allowX) {
                var scrollStepX = scrollStep.left;
                var scrollLeft = self.get('scrollLeft');
                if (keyCode == KeyCode.RIGHT) {
                    self.scrollToWithBounds({left: scrollLeft + scrollStepX});
                    ok = true;
                } else if (keyCode == KeyCode.LEFT) {
                    self.scrollToWithBounds({left: scrollLeft - scrollStepX});
                    ok = true;
                }
            }
            return ok;
        },

        getScrollStep: function () {
            var control = this;
            if (control.scrollStep) {
                return control.scrollStep;
            }
            var elDoc = $(this.get('el')[0].ownerDocument);
            var clientHeight = control.clientHeight;
            var clientWidth = control.clientWidth;
            return control.scrollStep = {
                top: Math.max(clientHeight * clientHeight * 0.7 / elDoc.height(), 20),
                left: Math.max(clientWidth * clientWidth * 0.7 / elDoc.width(), 20)
            };
        },

        handleMouseWheel: function (e) {
            if (this.get('disabled')) {
                return;
            }
            var max,
                min,
                self = this,
                scrollStep = self.getScrollStep(),
                deltaY,
                deltaX,
                maxScroll = self.maxScroll,
                minScroll = self.minScroll;

            if ((deltaY = e.deltaY) && self.allowScroll['top']) {
                var scrollTop = self.get('scrollTop');
                max = maxScroll.top;
                min = minScroll.top;
                if (scrollTop <= min && deltaY > 0 || scrollTop >= max && deltaY < 0) {
                } else {
                    self.scrollToWithBounds({top: scrollTop - e.deltaY * scrollStep['top']});
                    e.preventDefault();
                }
            }

            if ((deltaX = e.deltaX) && self.allowScroll['left']) {
                var scrollLeft = self.get('scrollLeft');
                max = maxScroll.left;
                min = minScroll.left;
                if (scrollLeft <= min && deltaX > 0 || scrollLeft >= max && deltaX < 0) {
                } else {
                    self.scrollToWithBounds({left: scrollLeft - e.deltaX * scrollStep['left']});
                    e.preventDefault();
                }
            }
        },

        'isAxisEnabled': function (axis) {
            return this.allowScroll[axis == 'x' ? 'left' : 'top'];
        },

        stopAnimation: function () {
            var self = this;
            if (self.scrollAnims.length) {
                S.each(self.scrollAnims, function (scrollAnim) {
                    scrollAnim.stop();
                });
                self.scrollAnims = [];
            }
            self.scrollToWithBounds({
                left: self.get('scrollLeft'),
                top: self.get('scrollTop')
            });
        },

        '_uiSetPageIndex': function (v) {
            this.scrollToPage(v);
        },

        _getPageIndexFromXY: function (v, allowX, direction) {
            var pagesOffset = this.pagesOffset.concat([]);
            var p2 = allowX ? 'left' : 'top';
            var i, offset;
            pagesOffset.sort(function (e1, e2) {
                return e1[p2] - e2[p2];
            });
            if (direction > 0) {
                for (i = 0; i < pagesOffset.length; i++) {
                    offset = pagesOffset[i];
                    if (offset[p2] >= v) {
                        return offset.index;
                    }
                }
            } else {
                for (i = pagesOffset.length - 1; i >= 0; i--) {
                    offset = pagesOffset[i];
                    if (offset[p2] <= v) {
                        return offset.index;
                    }
                }
            }
            return undefined;
        },

        scrollToPage: function (index, animCfg) {
            var self = this,
                pageOffset;
            if ((pageOffset = self.pagesOffset) && pageOffset[index]) {
                self.set('pageIndex', index);
                self.scrollTo(pageOffset[index], animCfg);
            }
        },

        scrollToWithBounds: function (cfg, anim) {
            var self = this;
            var maxScroll = self.maxScroll;
            var minScroll = self.minScroll;
            if (cfg.left) {
                cfg.left = Math.min(Math.max(cfg.left, minScroll.left), maxScroll.left);
            }
            if (cfg.top) {
                cfg.top = Math.min(Math.max(cfg.top, minScroll.top), maxScroll.top);
            }
            self.scrollTo(cfg, anim);
        },

        scrollTo: function (cfg, animCfg) {
            var self = this,
                left = cfg.left,
                top = cfg.top;
            if (animCfg) {
                var scrollLeft = self.get('scrollLeft'),
                    scrollTop = self.get('scrollTop'),
                    node = {},
                    to = {};
                if (left !== undefined) {
                    to.scrollLeft = left;
                    node.scrollLeft = self.get('scrollLeft');
                }
                if (top !== undefined) {
                    to.scrollTop = top;
                    node.scrollTop = self.get('scrollTop');
                }
                animCfg.frame = frame;
                animCfg.node = node;
                animCfg.to = to;
                var anim;
                self.scrollAnims.push(anim = new Anim(animCfg));
                anim.scrollView = self;
                anim.run();
            } else {
                if (left !== undefined) {
                    self.set('scrollLeft', left);
                }
                if (top !== undefined) {
                    self.set('scrollTop', top);
                }
            }
        }
    }, {
        ATTRS: {
            contentEl: {
            },
            scrollLeft: {
                view: 1,
                value: 0
            },
            scrollTop: {
                view: 1,
                value: 0
            },
            focusable: {
                // need process keydown
                value: !isTouchEventSupported
            },
            allowTextSelection: {
                value: true
            },
            handleMouseEvents: {
                value: false
            },
            snap: {
                value: false
            },
            snapDuration: {
                value: 0.3
            },
            snapEasing: {
                value: 'easeOut'
            },
            pageIndex: {
                value: 0
            },
            xrender: {
                value: Render
            }
        },
        xclass: 'scroll-view'
    });
}, {
    requires: ['node',
        'anim',
        'component/container',
        './base/render']
});