/**
 * scroll-view control
 * @author yiminghe@gmail.com
 */
KISSY.add('scroll-view/base', function (S, Node, Container, Render, undefined) {

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

    return Container.extend({

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
                scrollStep = self.scrollStep,
                ok = undefined;
            var allowX = self.isAxisEnabled('x');
            var allowY = self.isAxisEnabled('y');
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

        handleMouseWheel: function (e) {
            if (this.get('disabled')) {
                return;
            }
            var max,
                min,
                self = this,
                scrollStep = self.scrollStep,
                deltaY,
                deltaX,
                maxScroll = self.maxScroll,
                minScroll = self.minScroll;

            if ((deltaY = e.deltaY) && self.isAxisEnabled('y')) {
                var scrollTop = self.get('scrollTop');
                max = maxScroll.top;
                min = minScroll.top;
                if (scrollTop <= min && deltaY > 0 || scrollTop >= max && deltaY < 0) {
                } else {
                    self.scrollToWithBounds({top: scrollTop - e.deltaY * scrollStep['top']});
                    e.preventDefault();
                }
            }

            if ((deltaX = e.deltaX) && self.isAxisEnabled('x')) {
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
            self.$contentEl.stop();
            self.scrollToWithBounds({
                left: self.get('scrollLeft'),
                top: self.get('scrollTop')
            });
        },

        '_uiSetPageIndex': function (v) {
            this.scrollToPage(v);
        },

        _getPageIndexFromXY: function (v, allowX, direction) {
            var pagesXY = this.pagesXY.concat([]);
            var p2 = allowX ? 'x' : 'y';
            var i, xy;
            pagesXY.sort(function (e1, e2) {
                return e1[p2] - e2[p2];
            });
            if (direction > 0) {
                for (i = 0; i < pagesXY.length; i++) {
                    xy = pagesXY[i];
                    if (xy[p2] >= v) {
                        return xy.index;
                    }
                }
            } else {
                for (i = pagesXY.length - 1; i >= 0; i--) {
                    xy = pagesXY[i];
                    if (xy[p2] <= v) {
                        return xy.index;
                    }
                }
            }
            return undefined;
        },

        scrollToPage: function (index, animCfg) {
            var self = this,
                pageXy;
            if ((pageXy = self.pagesXY) && pageXy[index]) {
                self.setInternal('pageIndex', index);
                self.scrollTo({left: pageXy[index].x, top: pageXy[index].y}, animCfg);
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

        scrollTo: function (cfg, anim) {
            var self = this;
            var left = cfg.left,
                top = cfg.top;

            if (anim) {
                var scrollLeft = self.get('scrollLeft'),
                    scrollTop = self.get('scrollTop'),
                    contentEl = self.$contentEl,
                    animProperty = {
                        xx: {
                            fx: {
                                frame: function (anim, fx) {
                                    if (left !== undefined) {
                                        self.set('scrollLeft',
                                            scrollLeft + fx.pos * (left - scrollLeft));
                                    }
                                    if (top !== undefined) {
                                        self.set('scrollTop',
                                            scrollTop + fx.pos * (top - scrollTop));
                                    }
                                }
                            }
                        }
                    };
                contentEl.animate(animProperty, anim);
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
        'component/container',
        './base/render']
});