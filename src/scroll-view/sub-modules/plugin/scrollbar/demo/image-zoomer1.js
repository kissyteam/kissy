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
        setScale = function (scale) {
            markerStyle[transformProperty] = 'translate3d(0,0,0) scaleX(' +
                scale + ')' + ' ' + 'scaleY(' + scale + ')';
        };
    } else {
        setScale = function (scale) {
            markerStyle[transformProperty] = 'scale(' + scale + ')';
        };
    }

    var win = $(window);

    var transformProperty = getVendorInfo('transform').name;
    //var transformOriginProperty = transformProperty + 'Origin';
    var TapGesture = require('event/gesture/tap');
    var tap = TapGesture.TAP;

    var scrollView;
    var contentEl;
    var contentRegion;
    var imgEl;
    var markerEl;
    var placeHolderEl;

    var closeEl;
    var domImgEl;
    var maskEl;
    var markerStyle;
    var placeHolderStyle;
    var centerOffset;
    var initialScale;
    var currentScale = 1;

    var ZOOMER_CLASS = 'ks-image-zoomer';
    var MARKER_CLASS = 'ks-image-zoomer-marker';
    var PLACEHOLDER_CLASS = 'ks-image-zoomer-placeholder';
    var HIDE_SCROLLBAR_CLASS = ZOOMER_CLASS + '-hide-scrollbar';
    var CLOSE_CLASS = ZOOMER_CLASS + '-close';
    var CLOSE_HTML = '<div class="' + CLOSE_CLASS + '"></div>';
    var IMAGE_ZOOMER_CONTENT = '<div class="' + MARKER_CLASS + '"><img /></div>' + '<div class="' + PLACEHOLDER_CLASS + '"></div>';
    var MASK_CLASS = ZOOMER_CLASS + '-mask';
    var MASK_HTML = '<div class="' + MASK_CLASS + '"></div>';

    function syncContentRegion() {
        contentRegion = {
            width: win.width(),
            height: win.height()
        };
        markerStyle.width = contentRegion.width + 'px';
        markerStyle.height = contentRegion.height + 'px';
    }

    function syncScrollView(scale) {
        placeHolderStyle.width = contentRegion.width * currentScale + 'px';
        placeHolderStyle.height = contentRegion.height * currentScale + 'px';
        var scroll = {
            left: scrollView.get('scrollLeft'),
            top: scrollView.get('scrollTop')
        };
        scrollView.sync();
        if (scale === 1) {
            scrollView.scrollTo({
                left: 0,
                top: 0
            });
        } else {
            scrollView.scrollTo({
                left: Math.max(centerOffset.left * (scale - 1) + scroll.left, 0),
                top: Math.max(centerOffset.top * (scale - 1) + scroll.top, 0)
            });
        }

    }

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
            syncContentRegion();
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
        domImgEl = imgEl[0];
        closeEl = $(CLOSE_HTML).insertBefore(contentEl);
        markerEl = contentEl.one('.' + MARKER_CLASS);
        markerStyle = markerEl[0].style;
        placeHolderEl = contentEl.one('.' + PLACEHOLDER_CLASS)[0];
        placeHolderStyle = placeHolderEl.style;

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
        contentEl.on(TapGesture.SINGLE_TAP, close);
        imgEl.on(TapGesture.DOUBLE_TAP, function (e) {
            syncContentRegion();
            centerOffset = getCenterOffset(e);
            if (currentScale === 1) {
                currentScale = 5;
            } else {
                currentScale = 1;
            }
            setScale(currentScale);
            syncScrollView(currentScale);
        });

        $(window).on('resize orientationchange', function () {
            if (scrollView.get('visible')) {
                syncContentRegion();
                syncScrollView();
            }
        });
    }

    function resetStatus(cfg) {
        domImgEl.src = cfg.src;
        currentScale = initialScale = 1;
        setScale(1);
        scrollView.scrollTo({
            left: 0,
            top: 0
        });
    }

    // find centerOffset relative to left top of image
    function getCenterOffset(e) {
        var touches = e.touches,
            offsetX = -scrollView.get('scrollLeft'),
            offsetY = -scrollView.get('scrollTop'),
            centerOffset;
        if (touches) {
            centerOffset = {
                left: (touches[0].pageX + touches[1].pageX) / 2 - offsetX - win.scrollLeft(),
                top: (touches[0].pageY + touches[1].pageY) / 2 - offsetY - win.scrollTop()
            };
        } else {
            centerOffset = {
                left: e.pageX - offsetX - win.scrollLeft(),
                top: e.pageY - offsetY - win.scrollTop()
            };
        }
        return centerOffset;
    }

    function pinchStart(e) {
        scrollView.stopAnimation();
        centerOffset = getCenterOffset(e);
        initialScale = currentScale;
        syncContentRegion();
    }

    function pinch(e) {
        // mousewheel
        if (e.deltaY) {
            e.stopPropagation();
            pinchStart(e);
            e.scale = e.deltaY > 0 ? 2 : 0.5;
        }

        if (!e.scale || !centerOffset) {
            return;
        }

        var toScale = initialScale * e.scale;

        // centerOffset is stable
        if (toScale < 1) {
            if (currentScale === 1) {
                return;
            }
            setScale(currentScale = 1);
            syncScrollView(1);
            return;
        }

        if (toScale > 10) {
            return;
        }

        currentScale = toScale;

        setScale(currentScale);
        syncScrollView(e.scale);
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