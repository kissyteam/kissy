/**
 * simple image-zoomer using scroll-view and touch gesture
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Base = require('base');
    var ScrollView = require('scroll-view');
    var ScrollbarPlugin = require('scroll-view/plugin/scrollbar');
    var Node = require('node');
    var $ = Node.all;
    var win = $(window);
    var TapGesture = require('event/gesture/tap');

    var ZOOMER_CLASS = 'ks-image-zoomer';
    var TRIGGER_CLASS = 'ks-image-zoomer-trigger';
    var TRIGGER_ACTIVE_CLASS = 'ks-image-zoomer-trigger-active';
    var WRAPPER_CLASS = 'ks-image-zoomer-wrap';
    var PLACEHOLDER_CLASS = 'ks-image-zoomer-placeholder';
    var HIDE_SCROLLBAR_CLASS = ZOOMER_CLASS + '-hide-scrollbar';
    var CLOSE_CLASS = ZOOMER_CLASS + '-close';
    var CLOSE_HTML = '<div class="' + CLOSE_CLASS + '"></div>';
    var IMAGE_ZOOMER_CONTENT = '<div class="' + WRAPPER_CLASS + '"><img /></div>' +
        '<div class="' + PLACEHOLDER_CLASS + '"></div>';
    var MASK_CLASS = ZOOMER_CLASS + '-mask';
    var MASK_HTML = '<div class="' + MASK_CLASS + '"></div>';

    function buildTriggerHtml(length) {
        var triggerHtml = '<ul class="ks-image-zoomer-nav">';
        for (var i = 0; i < length; i++) {
            triggerHtml += '<li class="' + TRIGGER_CLASS + '">' + (i + 1) + '</li>';
        }
        triggerHtml += '</ul>';
        return triggerHtml;
    }

    function close() {
        this.scrollView.stopAnimation();
        this.scrollView.hide();
    }

    function init(self) {
        if (self.scrollView) {
            return;
        }
        var scrollView = self.scrollView = new ScrollView({
            lockX: false,
            content: IMAGE_ZOOMER_CONTENT,
            visible: false,
            elCls: ZOOMER_CLASS,
            listeners: {
                beforeVisibleChange: {
                    fn: beforeScrollViewShow,
                    context: self
                }
            },
            plugins: [ScrollbarPlugin]
        }).render();

        scrollView.get('el').append(buildTriggerHtml(self.get('images').length));

        self.triggers = scrollView.get('el').all('.' + TRIGGER_CLASS);

        var contentEl = self.contentEl = scrollView.get('contentEl');
        var imgEl = self.imgEl = contentEl.one('img');
        self.domImgEl = imgEl[0];
        self.closeEl = $(CLOSE_HTML).insertBefore(contentEl);
        var imageWrapEl = self.imageWrapEl = contentEl.one('.' + WRAPPER_CLASS);
        self.imageWrapStyle = imageWrapEl[0].style;
        var placeHolderEl = self.placeHolderEl = contentEl.one('.' + PLACEHOLDER_CLASS)[0];
        self.placeHolderStyle = placeHolderEl.style;

        imgEl.on('pinchStart', pinchStart, self);
        imgEl.on('pinch mousewheel', pinch, self);
        self.maskEl = $(MASK_HTML).prependTo(document.body);

        // tap(touch down is buggy on safari ios)
        self.contentEl.on(TapGesture.SINGLE_TAP, close, self);
        self.closeEl.on(TapGesture.TAP, close, self);
        self.imgEl.on(TapGesture.DOUBLE_TAP, onDoubleTap, self);
        win.on('resize orientationchange', onResize, self);
        updateViewport(self);

        scrollView.on('touchEnd', onDragEnd, self);
    }

    function onDragEnd(e) {
        var self = this;
        var scrollView = self.scrollView;
        var scrollLeft = scrollView.get('scrollLeft');
        var images = self.get('images');
        var activeIndex = self.get('activeIndex');
        var isX = Math.abs(e.deltaX) > Math.abs(e.deltaY);
        if (!isX) {
            return;
        }
        if (e.deltaX < -30 && scrollLeft >= scrollView.scrollWidth - scrollView.clientWidth) {
            activeIndex++;
            if (activeIndex < images.length) {
                // do not bounce
                e.preventDefault();
                scrollView.stopAnimation();
                self.set('activeIndex', activeIndex);
            }
        } else if (e.deltaX > 30 && scrollLeft <= 0 && activeIndex > 0) {
            activeIndex--;
            scrollView.stopAnimation();
            e.preventDefault();
            self.set('activeIndex', activeIndex);
        }
    }

    function beforeScrollViewShow(e) {
        var self = this;
        self.maskEl[e.newVal ? 'show' : 'hide']();
        $([document.documentElement, document.body])[e.newVal ?
            'addClass' :
            'removeClass'](HIDE_SCROLLBAR_CLASS);
        if (e.newVal) {
            updateViewport(self);
        }
    }

    function onDoubleTap(e) {
        var self = this;
        self.centerOffset = getCenterOffset(self, e);
        self.set('scale', self.get('scale') === 1 ? 5 : 1);
    }

    function updateViewport(self) {
        self.viewport = {
            width: win.width(),
            height: win.height()
        };
        self.imageWrapEl.css(self.viewport);
    }

    function onResize() {
        var self = this;
        if (self.scrollView.get('visible')) {
            updateViewport(self);
            self.set('scale', 1);
        }
    }

    // find centerOffset relative to left top of image
    function getCenterOffset(self, e) {
        var touches = e.touches,
            scrollView = self.scrollView,
            offsetX = -scrollView.get('scrollLeft'),
            offsetY = -scrollView.get('scrollTop'),
            x, y,
            centerOffset;
        if (touches) {
            x = (touches[0].pageX + touches[1].pageX) / 2 - win.scrollLeft();
            y = (touches[0].pageY + touches[1].pageY) / 2 - win.scrollTop();
            centerOffset = {
                left: x - offsetX,
                top: y - offsetY
            };
        } else {
            var pageX = e.pageX;
            var pageY = e.pageY;
            x = pageX - win.scrollLeft();
            y = pageY - win.scrollTop();
            centerOffset = {
                left: pageX - offsetX,
                top: pageY - offsetY
            };
        }
        centerOffset.scale = self.get('scale');
        centerOffset.x = x;
        centerOffset.y = y;
        return centerOffset;
    }

    function pinchStart(e) {
        var self = this;
        self.scrollView.stopAnimation();
        self.centerOffset = getCenterOffset(self, e);
        self.initialScale = self.get('scale');
    }

    function pinch(e) {
        var self = this;
        // mousewheel
        if (e.deltaY) {
            e.stopPropagation();
            pinchStart.call(self, e);
            e.scale = e.deltaY > 0 ? 2 : 0.5;
        }

        if (!e.scale) {
            return;
        }

        var toScale = self.initialScale * e.scale;

        // centerOffset is stable
        if (toScale < 1) {
            self.set('scale', 1);
            return;
        }

        if (toScale > 10) {
            return;
        }

        self.set('scale', toScale);
    }

    return Base.extend({
        closeEl: null,

        scrollView: null,

        viewport: null,

        contentEl: null,

        imgEl: null,

        imageWrapEl: null,

        placeHolderEl: null,

        placeHolderStyle: null,

        centerOffset: null,

        initialScale: 1,

        maskEl: null,

        imageWrapStyle: null,

        _onSetActiveIndex: function (index) {
            var self = this;
            self.triggers.removeClass(TRIGGER_ACTIVE_CLASS);
            self.triggers.item(index).addClass(TRIGGER_ACTIVE_CLASS);
            self.domImgEl.src = self.get('images')[index];
            self.set('scale', self.initialScale = 1);
        },

        _onSetScale: function (scale) {
            var self = this;
            self.imageWrapEl.css('transform', 'translate3d(0,0,0) scale(' + scale + ',' + scale + ')');
            self.placeHolderStyle.width = self.viewport.width * scale + 'px';
            self.placeHolderStyle.height = self.viewport.height * scale + 'px';
            if (scale === 1) {
                self.scrollView.scrollTo({
                    left: 0,
                    top: 0
                });
            } else {
                var centerOffset = self.centerOffset;
                self.scrollView.scrollTo({
                    left: Math.max(centerOffset.left * scale / centerOffset.scale - centerOffset.x, 0),
                    top: Math.max(centerOffset.top * scale / centerOffset.scale - centerOffset.y, 0)
                });
            }
            // sync must be last
            self.scrollView.sync();
        },

        destructor: function () {
            win.detach('resize orientationchange', onResize, this);
        },

        show: function (index) {
            var self = this;
            init(self);
            self.set('activeIndex', index || 0);
            self.set('scale', self.initialScale = 1);
            self.scrollView.show();
        }
    }, {
        ATTRS: {
            /**
             * images
             * @type Object[]
             */
            images: {
                value: []
            },

            scale: {

            },

            activeIndex: {
            }
        }
    });
});