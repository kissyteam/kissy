/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 23 22:59
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 scroll-view/base/render
 scroll-view/base
*/

/**
 * scroll-view render
 * @author yiminghe@gmail.com
 */
KISSY.add('scroll-view/base/render', function (S, Node, Container, ContentRenderExtension) {

    // http://www.html5rocks.com/en/tutorials/speed/html5/
    var Features = S.Features,
        $ = Node.all,
//        MARKER_CLS = 'ks-scrollview-marker',
        supportCss3 = Features.isTransformSupported(),
        transformProperty;

//    function createMarker(contentEl) {
//        var m;
//        if (m = contentEl.one('.' + MARKER_CLS)) {
//            return m;
//        }
//        return $('<div class="' + MARKER_CLS + '" ' +
//            'style="position:absolute;' +
//            'left:0;' +
//            'top:0;' +
//            'width:100%;' +
//            'height:100%;' +
//            '"></div>').appendTo(contentEl);
//    }

    var methods = {
        syncUI: function () {
            var self = this,
                control = self.control,
                el = control.el,
                contentEl = control.contentEl,
                $contentEl = control.$contentEl;
            // consider pull to refresh
            // refresh label will be prepended to el
            // contentEl must be absolute
            // or else
            // relative is weird, should math.max(contentEl.scrollHeight,el.scrollHeight)
            // will affect pull to refresh
            var scrollHeight = contentEl.offsetHeight,
                scrollWidth = contentEl.offsetWidth;

            var clientHeight = el.clientHeight,
                allowScroll,
                clientWidth = el.clientWidth;

            control.scrollHeight = scrollHeight;
            control.scrollWidth = scrollWidth;
            control.clientHeight = clientHeight;
            control.clientWidth = clientWidth;

            allowScroll = control.allowScroll = {};

            if (scrollHeight > clientHeight) {
                allowScroll.top = 1;
            }
            if (scrollWidth > clientWidth) {
                allowScroll.left = 1;
            }

            control.minScroll = {
                left: 0,
                top: 0
            };

            var maxScrollX,
                maxScrollY;

            control.maxScroll = {
                left: maxScrollX = scrollWidth - clientWidth,
                top: maxScrollY = scrollHeight - clientHeight
            };

            delete control.scrollStep;

            var snap = control.get('snap'),
                scrollLeft = control.get('scrollLeft'),
                scrollTop = control.get('scrollTop');

            if (snap) {
                var elOffset = $contentEl.offset();
                var pages = control.pages = typeof snap == 'string' ?
                        $contentEl.all(snap) :
                        $contentEl.children(),
                    pageIndex = control.get('pageIndex'),
                    pagesXY = control.pagesXY = [];
                pages.each(function (p, i) {
                    var offset = p.offset(),
                        x = offset.left - elOffset.left,
                        y = offset.top - elOffset.top;
                    if (x <= maxScrollX && y <= maxScrollY) {
                        pagesXY[i] = {
                            x: x,
                            y: y,
                            index: i
                        };
                    }
                });
                if (pageIndex) {
                    control.scrollToPage(pageIndex);
                    return;
                }
            }

            // in case content is reduces
            control.scrollToWithBounds({
                left: scrollLeft,
                top: scrollTop
            });
        },

        '_onSetScrollLeft': function (v) {
            this.control.contentEl.style.left = -v + 'px';
        },

        '_onSetScrollTop': function (v) {
            this.control.contentEl.style.top = -v + 'px';
        }
    };

    if (supportCss3) {
        transformProperty = Features.getTransformProperty();

        methods._onSetScrollLeft = function (v) {
            var control = this.control;
            control.contentEl.style[transformProperty] = 'translate3d(' + -v + 'px,' + -control.get('scrollTop') + 'px,0)';
        };

        methods._onSetScrollTop = function (v) {
            var control = this.control;
            control.contentEl.style[transformProperty] = 'translate3d(' + -control.get('scrollLeft') + 'px,' + -v + 'px,0)';
        };
    }

    return Container.getDefaultRender().extend([ContentRenderExtension],
        methods, {
            name: 'ScrollViewRender'
        });

}, {
    requires: ['node',
        'component/container',
        'component/extension/content-render']
});
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
                scrollStep = self.getScrollStep(),
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

        getScrollStep:function(){
            var control=this;
            if(control.scrollStep){
                return control.scrollStep;
            }
            var elDoc = $(el.ownerDocument);
            var clientHeight=control.clientHeight;
            var clientWidth=control.clientWidth;
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

