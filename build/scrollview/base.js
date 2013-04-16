/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:22
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


        syncUI: function () {
            var self = this,
                domEl = this.get('el')[0],
                domContentEl = this.get('contentEl')[0],
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

            self.maxScroll = {
                left: scrollWidth - clientWidth,
                top: scrollHeight - clientHeight
            };

            var elDoc = $(domEl.ownerDocument);

            self.scrollStep = {
                top: Math.max(clientHeight * clientHeight * 0.7 / elDoc.height(), 20),
                left: Math.max(clientWidth * clientWidth * 0.7 / elDoc.width(), 20)
            };

            var scrollLeft = self.get('scrollLeft'),
                scrollTop = self.get('scrollTop');

            // in case content is reduces
            self.scrollTo(scrollLeft, scrollTop);
        },

        'isAxisEnabled': function (axis) {
            return this._allowScroll[axis == 'x' ? 'left' : 'top'];
        },


        stopAnimation: function () {
            this.get('contentEl').stop();
        },

        scrollTo: function (left, top) {
            var self = this,
                maxScroll = self.maxScroll,
                minScroll = self.minScroll;
            self.stopAnimation();
            if (left != undefined) {
                left = constrain(left, maxScroll.left, minScroll.left);
                self.set('scrollLeft', left);
            }
            if (top != undefined) {
                top = constrain(top, maxScroll.top, minScroll.top);
                self.set('scrollTop', top);
            }
        }

    }, {
        ATTRS: {
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
    var supportCss3 = S.Features.isTransformSupported();
    var css3Prefix = S.Features.getTransformPrefix();

    var methods = {

        renderUI: function () {
            this._contentEl = this.get('contentEl')[0];
        },

        '_onSetScrollLeft': function (v) {
            this._contentEl.style.left = -v + 'px';
        },

        '_onSetScrollTop': function (v) {
            this._contentEl.style.top = -v + 'px';
        }

    };

    var transformProperty = css3Prefix ? css3Prefix + 'Transform' : 'transform';

    if (supportCss3) {

        methods._onSetScrollLeft = function (v) {
            var scrollTop = this.get('scrollTop');
            this._contentEl.style[transformProperty] = 'translate3d(' + -v + 'px,' + -scrollTop + 'px,0)';
        };

        methods._onSetScrollTop = function (v) {
            var scrollLeft = this.get('scrollLeft');
            this._contentEl.style[transformProperty] = 'translate3d(' + -scrollLeft + 'px,' + -v + 'px,0)';
        };

    }

    return Component.Render.extend([Extension.ContentBox.Render], methods, {
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
