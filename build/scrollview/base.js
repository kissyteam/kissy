/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: May 23 00:54
*/
/**
 * scrollview controller
 * @author yiminghe@gmail.com
 */
KISSY.add('scrollview/base', function (S, DOM, Component, Extension, Render, Event) {

    var undefined = undefined;

    var $ = S.all;

    var isTouchSupported = S.Features.isTouchSupported();

    var KeyCodes = Event.KeyCodes;

    function constrain(v, max, min) {
        return Math.min(Math.max(v, min), max);
    }

    return Component.Controller.extend({

        bindUI: function () {
            var self = this,
                el = self.get('el');
            el.on('mousewheel', self._onMouseWheel, self);
            // textarea enter cause el to scroll
            // bug: left top scroll does not fire scroll event, because scrollTop is 0!
            el.on('scroll', self._onElScroll, self);
        },

        syncUI: function () {
            var self = this,
                domEl = self.get('el')[0],
                contentEl = self.get('contentEl'),
                domContentEl = contentEl[0],
            // wierd ...
                scrollHeight = Math.max(domEl.scrollHeight, domContentEl.scrollHeight),
                scrollWidth = Math.max(domEl.scrollWidth, domContentEl.scrollWidth) ,
                clientHeight = domEl.clientHeight,
                _allowScroll,
                clientWidth = domEl.clientWidth;

            self.scrollHeight = scrollHeight;
            self.scrollWidth = scrollWidth;
            self.clientHeight = clientHeight;
            self.clientWidth = clientWidth;

            var elOffset = contentEl.offset();

            _allowScroll = self._allowScroll = {};

            if (scrollHeight > clientHeight) {
                _allowScroll.top = 1;
            }
            if (scrollWidth > clientWidth) {
                _allowScroll.left = 1;
            }

            self.minScroll = {
                left: 0,
                top: 0
            };

            var maxScrollX, maxScrollY;
            self.maxScroll = {
                left: maxScrollX = scrollWidth - clientWidth,
                top: maxScrollY = scrollHeight - clientHeight
            };

            var elDoc = $(domEl.ownerDocument);

            self.scrollStep = {
                top: Math.max(clientHeight * clientHeight * 0.7 / elDoc.height(), 20),
                left: Math.max(clientWidth * clientWidth * 0.7 / elDoc.width(), 20)
            };

            var snap = self.get('snap'),
                scrollLeft = self.get('scrollLeft'),
                scrollTop = self.get('scrollTop');

            if (snap) {
                var pages = self._pages = typeof snap == 'string' ?
                        contentEl.all(snap) :
                        contentEl.children(),
                    pageIndex = self.get('pageIndex'),
                    pagesXY = self._pagesXY = [];
                pages.each(function (p, i) {
                    var offset = p.offset(),
                        x = offset.left - elOffset.left,
                        y = offset.top - elOffset.top;
                    if (x<= maxScrollX && y <= maxScrollY) {
                        pagesXY[i] = {
                            x:x,
                            y:y,
                            index: i
                        };
                    }
                });
                if (pageIndex) {
                    this.scrollToPage(pageIndex);
                    return;
                }
            }

            // in case content is reduces
            self.scrollTo(scrollLeft, scrollTop);
        },

        _onElScroll: function () {
            var self = this,
                el = self.get('el'),
                domEl = el[0],
                scrollTop = domEl.scrollTop,
                scrollLeft = domEl.scrollLeft;
            if (scrollTop) {
                self.set('scrollTop', scrollTop + self.get('scrollTop'));
            }
            if (scrollLeft) {
                self.set('scrollLeft', scrollLeft + self.get('scrollLeft'));
            }
            domEl.scrollTop = domEl.scrollLeft = 0;
        },

        handleKeyEventInternal: function (e) {
            // no need to process disabled (already processed by Component)
            var target = e.target,
                nodeName = DOM.nodeName(target);
            // editable element
            if (nodeName == 'input' ||
                nodeName == 'textarea' ||
                nodeName == 'select' ||
                DOM.hasAttr(target, 'contenteditable')) {
                return undefined;
            }
            var self = this,
                keyCode = e.keyCode,
                allowX = self.isAxisEnabled('x'),
                allowY = self.isAxisEnabled('y'),
                minScroll = self.minScroll,
                maxScroll = self.maxScroll,
                scrollStep = self.scrollStep,
                isMax, isMin,
                ok = undefined;
            if (allowY) {
                var scrollStepY = scrollStep.top,
                    clientHeight = self.clientHeight,
                    scrollTop = self.get('scrollTop');
                isMax = scrollTop == maxScroll.top;
                isMin = scrollTop == minScroll.top;
                if (keyCode == KeyCodes.DOWN) {
                    if (isMax) {
                        return undefined;
                    }
                    self.scrollTo(undefined, scrollTop + scrollStepY);
                    ok = true;
                } else if (keyCode == KeyCodes.UP) {
                    if (isMin) {
                        return undefined;
                    }
                    self.scrollTo(undefined, scrollTop - scrollStepY);
                    ok = true;
                } else if (keyCode == KeyCodes.PAGE_DOWN) {
                    if (isMax) {
                        return undefined;
                    }
                    self.scrollTo(undefined, scrollTop + clientHeight);
                    ok = true;
                } else if (keyCode == KeyCodes.PAGE_UP) {
                    if (isMin) {
                        return undefined;
                    }
                    self.scrollTo(undefined, scrollTop - clientHeight);
                    ok = true;
                }
            }
            if (allowX) {
                var scrollStepX = scrollStep.left,
                    scrollLeft = self.get('scrollLeft');
                isMax = scrollLeft == maxScroll.left;
                isMin = scrollLeft == minScroll.left;
                if (keyCode == KeyCodes.RIGHT) {
                    if (isMax) {
                        return undefined;
                    }
                    self.scrollTo(scrollLeft + scrollStepX);
                    ok = true;
                } else if (keyCode == KeyCodes.LEFT) {
                    if (isMin) {
                        return undefined;
                    }
                    self.scrollTo(scrollLeft - scrollStepX);
                    ok = true;
                }
            }
            return ok;
        },

        _onMouseWheel: function (e) {
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
                    self.scrollTo(undefined, scrollTop - e.deltaY * scrollStep['top']);
                    e.preventDefault();
                }
            }

            if ((deltaX = e.deltaX) && self.isAxisEnabled('x')) {
                var scrollLeft = self.get('scrollLeft');
                max = maxScroll.left;
                min = minScroll.left;
                if (scrollLeft <= min && deltaX > 0 || scrollLeft >= max && deltaX < 0) {
                } else {
                    self.scrollTo(scrollLeft - e.deltaX * scrollStep['left']);
                    e.preventDefault();
                }
            }
        },

        'isAxisEnabled': function (axis) {
            return this._allowScroll[axis == 'x' ? 'left' : 'top'];
        },


        stopAnimation: function () {
            this.get('contentEl').stop();
        },

        '_uiSetPageIndex': function (v) {
            this.scrollToPage(v);
        },

        _getPageIndexFromXY: function (v, allowX, direction) {
            var pagesXY = this._pagesXY.concat([]);
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
            var pageXY;
            if ((pageXY = this._pagesXY) && pageXY[index]) {
                this.setInternal('pageIndex', index);
                this.scrollTo(pageXY[index].x, pageXY[index].y, animCfg);
            }
        },

        scrollTo: function (left, top, animCfg) {
            var self = this,
                setLeft,
                setTop,
                maxScroll = self.maxScroll,
                minScroll = self.minScroll;

            if (left != undefined) {
                left = constrain(left, maxScroll.left, minScroll.left);
                setLeft = 1;
            }
            if (top != undefined) {
                top = constrain(top, maxScroll.top, minScroll.top);
                setTop = 1;
            }

            if (animCfg) {
                var scrollLeft = self.get('scrollLeft'),
                    scrollTop = self.get('scrollTop'),
                    contentEl = self.get('contentEl'),
                    anim = {
                        xx: {
                            fx: {
                                frame: function (anim, fx) {
                                    if (setLeft) {
                                        self.set('scrollLeft',
                                            scrollLeft + fx.pos * (left - scrollLeft));
                                    }
                                    if (setTop) {
                                        self.set('scrollTop',
                                            scrollTop + fx.pos * (top - scrollTop));
                                    }
                                }
                            }
                        }
                    };
                contentEl.animate(anim, animCfg);
            } else {
                if (setLeft) {
                    self.set('scrollLeft', left);
                }
                if (setTop) {
                    self.set('scrollTop', top);
                }
            }
        }

    }, {
        ATTRS: {
            contentEl: {
                view: 1
            },
            scrollLeft: {
                view: 1
            },
            scrollTop: {
                view: 1
            },
            focusable: {
                // need process keydown
                value: !isTouchSupported
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
        }
    }, {
        xclass: 'scrollview'
    });

}, {
    requires: ['dom', 'component/base', 'component/extension', './base/render', 'event']
});/**
 * scrollview render
 * @author yiminghe@gmail.com
 */
KISSY.add('scrollview/base/render', function (S, Component, Extension) {

    // http://www.html5rocks.com/en/tutorials/speed/html5/
    var supportCss3 = S.Features.isTransformSupported(),
        transformProperty;

    var methods = {

        '_onSetScrollLeft': function (v) {
            this.get('contentEl')[0].style.left = -v + 'px';
        },

        '_onSetScrollTop': function (v) {
            this.get('contentEl')[0].style.top = -v + 'px';
        }

    };

    if (supportCss3) {

        var css3Prefix = S.Features.getTransformPrefix();

        transformProperty = css3Prefix ? css3Prefix + 'Transform' : 'transform';

        methods._onSetScrollLeft = function (v) {
            var scrollTop = this.get('scrollTop');
            this.get('contentEl')[0].style[transformProperty] = 'translate3d(' + -v + 'px,' + -scrollTop + 'px,0)';
        };

        methods._onSetScrollTop = function (v) {
            var scrollLeft = this.get('scrollLeft');
            this.get('contentEl')[0].style[transformProperty] = 'translate3d(' + -scrollLeft + 'px,' + -v + 'px,0)';
        };

    }

    return Component.Render.extend([Extension.ContentRender], methods, {
        ATTRS: {
            scrollLeft: {
                value: 0
            },
            scrollTop: {
                value: 0
            }
        }
    });

}, {
    requires: ['component/base', 'component/extension']
});
