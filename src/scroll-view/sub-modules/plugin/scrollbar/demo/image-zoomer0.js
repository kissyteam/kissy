KISSY.add(function (S, require) {
    var $ = require('node');
    var ScrollView = require('scroll-view');
    var ScrollbarPlugin = require('scroll-view/plugin/scrollbar');

    var VENDORS = [
            'Webkit',
            'Moz',
            'O',
            // ms is special .... !
            'ms'
        ],
        documentElementStyle = document.documentElement.style;

    function has3d() {
        var el = $('<p></p>').prependTo(document.body),
            has3d_;
        // Add it to the body to get the computed style.
        el.css('transform', 'translate3d(1px,1px,1px)');
        has3d_ = el.css('transform');
        el.remove();
        return (has3d_ !== undefined && has3d_.length > 0 && has3d_ !== 'none');
    }

    // return prefixed css prefix name
    function getVendorInfo(name) {
        // if already prefixed or need not to prefix
        if (!documentElementStyle || name in documentElementStyle) {
            return {
                name: name,
                prefix: ''
            };
        } else {
            var upperFirstName = name.charAt(0).toUpperCase() + name.slice(1),
                vendorName,
                i = VENDORS.length;

            while (i--) {
                vendorName = VENDORS[i] + upperFirstName;
                if (vendorName in documentElementStyle) {
                    return {
                        name: vendorName,
                        prefix: VENDORS[i]
                    };
                }
            }

            return {
                name: name,
                prefix: false
            };
        }
    }

    var setScale;

    if (has3d()) {
        setScale = function (imgStyle, scale) {
            imgStyle[transformProperty] = 'translate3d(0,0,0) scaleX(' +
                scale + ')' + ' ' + 'scaleY(' + scale + ')';
        };
    } else {
        setScale = function (imgStyle, scale) {
            imgStyle[transformProperty] = 'scale(' + scale + ')';
        };
    }

    var win = $(window);

    var transformProperty = getVendorInfo('transform').name;
    var transformOriginProperty = transformProperty + 'Origin';
    var TapGesture = require('event/gesture/tap');
    var tap = TapGesture.TAP;

    var scrollView;
    var scroll;
    var contentEl;
    var contentRegion;
    var currentScroll;
    var imgEl;

    var closeEl;
    var domImgEl;
    var imgStyle;
    var maskEl;
    var centerOffset;
    var markerEl;
    var initialScale;
    var currentScale = 1;
    var markerStyle;

    var ZOOMER_CLASS = 'ks-image-zoomer';
    var HIDE_SCROLLBAR_CLASS = ZOOMER_CLASS + '-hide-scrollbar';
    var CLOSE_CLASS = ZOOMER_CLASS + '-close';
    var MARKER_CLASS = ZOOMER_CLASS + '-marker';
    var CLOSE_HTML = '<div class="' + CLOSE_CLASS + '"></div>';
    var IMAGE_ZOOMER_CONTENT = '<img /><div class="' + MARKER_CLASS + '"></div>';
    var MASK_CLASS = ZOOMER_CLASS + '-mask';
    var MASK_HTML = '<div class="' + MASK_CLASS + '"></div>';

    function initScrollView() {
        if (scrollView) {
            return;
        }
        scrollView = new ScrollView({
            lockX: false,
            content: IMAGE_ZOOMER_CONTENT,
            elCls: ZOOMER_CLASS,
            listeners: {
                afterVisibleChange: onScrollViewShow
            },
            plugins: [ScrollbarPlugin]
        }).render();

        // no fixed for android 2.3
        win.on('resize', function () {
            if (scrollView.get('visible')) {
                scrollView.get('el').css({
                    width: win.width(),
                    height: win.height()
                });
                maskEl.css({
                    width: win.width(),
                    height: win.height()
                });
            }
        });

        function onScrollViewShow(e) {
            maskEl[e.newVal ? 'show' : 'hide']();
            $([document.documentElement, document.body])[e.newVal ? 'addClass' :
                'removeClass'](HIDE_SCROLLBAR_CLASS);
            maskEl.css({
                width: win.width(),
                height: win.height(),
                left: win.scrollLeft(),
                top: win.scrollTop()
            });
            scrollView.get('el').css({
                width: win.width(),
                height: win.height(),
                left: win.scrollLeft(),
                top: win.scrollTop()
            });
        }

        contentEl = scrollView.get('contentEl');
        imgEl = contentEl.one('img');
        markerEl = contentEl.one('.' + MARKER_CLASS);
        markerStyle = markerEl[0].style;
        domImgEl = imgEl[0];
        closeEl = $(CLOSE_HTML).insertBefore(contentEl);
        imgStyle = domImgEl.style;
        imgStyle[transformOriginProperty] = '0 0';
        contentEl.on('pinchStart', pinchStart);
        contentEl.on('pinch mousewheel', pinch);
        maskEl = $(MASK_HTML).prependTo(document.body);

        onScrollViewShow({
            newVal: 1
        });

        function close() {
            scrollView.stopAnimation();
            scrollView.hide();
        }

        // tap(touch down is buggy on safari ios)
        closeEl.on(tap, close);
        contentEl.on(tap, close);

        $(window).on('resize orientationchange', function () {
            if (scrollView.get('visible')) {
                scrollView.sync();
            }
        });
        contentRegion = {
            width: contentEl.width(),
            height: contentEl.height()
        };
    }

    function resetStatus(cfg) {
        markerStyle.width = '0px';
        markerStyle.height = '0px';
        domImgEl.src = cfg.src;
        var width = win.width();
        var height = win.height();
        var imageWidth = cfg.width;
        var originWidth = imageWidth;
        var imageHeight = cfg.height;
        var originHeight = imageHeight;
        if (imageHeight > height || imageWidth > width) {
            var ratio = Math.min(width / imageWidth, height / imageHeight);
            originWidth = imageWidth * ratio;
            originHeight = imageHeight * ratio;
        }
        domImgEl.width = originWidth;
        domImgEl.height = originHeight;
        scroll = currentScroll = {
            left: 0,
            top: 0
        };
        currentScale = initialScale = 1;
        setScale(imgStyle, 1);
    }

    // finger centerOffset relative to left top of image
    function getCenterOffset(e) {
        var touches = e.touches,
            offsetX = -currentScroll.left,
            offsetY = -currentScroll.top,
            scrollLeft = win.scrollLeft(),
            scrollTop = win.scrollTop(),
            centerOffset;
        if (touches) {
            centerOffset = {
                left: (touches[0].pageX + touches[1].pageX) / 2 - offsetX - scrollLeft,
                top: (touches[0].pageY + touches[1].pageY) / 2 - offsetY - scrollTop
            };
        } else {
            centerOffset = {
                left: e.pageX - offsetX - scrollLeft,
                top: e.pageY - offsetY - scrollTop
            };
        }
        return centerOffset;
    }

    function pinchStart(e) {
        scroll = currentScroll = {
            left: scrollView.get('scrollLeft'),
            top: scrollView.get('scrollTop')
        };
        scrollView.stopAnimation();
        centerOffset = getCenterOffset(e);
        initialScale = currentScale;
    }

    function pinch(e) {
        // mousewheel
        if (e.deltaY) {
            e.stopPropagation();
            pinchStart(e);
            e.scale = e.deltaY > 0 ? 2 : 0.5;
        }

        if (!e.scale) {
            return;
        }

        var toScale = initialScale * e.scale;

        // centerOffset is stable
        if (toScale < 1) {
            if (currentScale === 1) {
                return;
            }
            currentScroll = {
                left: 0,
                top: 0
            };
            setScale(imgStyle, currentScale = 1);
            markerStyle.width = contentRegion.width + 'px';
            markerStyle.height = contentRegion.height + 'px';
            scrollView.scrollTo(currentScroll);
            scrollView.sync();
            return;
        }

        if (toScale > 10) {
            return;
        }

        currentScale = toScale;

        // keep center point fixed in viewport
        currentScroll = {
            // x*scale-(x-scroll)
            left: Math.max(centerOffset.left * (e.scale - 1) + scroll.left, 0),
            top: Math.max(centerOffset.top * (e.scale - 1) + scroll.top, 0)
        };

        // translate3d 3d acceleration
        setScale(imgStyle, currentScale);
        markerStyle.width = contentRegion.width * currentScale + 'px';
        markerStyle.height = contentRegion.height * currentScale + 'px';

        scrollView.scrollTo(currentScroll);
        scrollView.sync();
    }

    return {
        showImage: function (cfg) {
            initScrollView();
            resetStatus(cfg);
            scrollView.show();
            scrollView.sync();
        }
    };
});