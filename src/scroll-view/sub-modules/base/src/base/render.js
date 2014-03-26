/**
 * @ignore
 * scroll-view render
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Container = require('component/container');
    var ContentRenderExtension = require('component/extension/content-render');

    // http://www.html5rocks.com/en/tutorials/speed/html5/
    var Feature = S.Feature,
//        MARKER_CLS = 'ks-scrollview-marker',
        transformVendorInfo = Feature.getCssVendorInfo('transform'),
        floor = Math.floor,
        transformProperty;

    var isTransform3dSupported = S.Feature.isTransform3dSupported();

    // http://www.html5rocks.com/en/tutorials/speed/html5/
    var supportCss3 = !!transformVendorInfo;

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
                contentEl = control.contentEl;
            // consider pull to refresh
            // refresh label will be prepended to el
            // contentEl must be absolute
            // or else
            // relative is weird, should math.max(contentEl.scrollHeight,el.scrollHeight)
            // will affect pull to refresh
            var scrollHeight = Math.max(contentEl.offsetHeight, contentEl.scrollHeight),
                scrollWidth = Math.max(contentEl.offsetWidth, contentEl.scrollWidth);

            var clientHeight = el.clientHeight,
                clientWidth = el.clientWidth;

            control.set('dimension', {
                'scrollHeight': scrollHeight,
                'scrollWidth': scrollWidth,
                'clientWidth': clientWidth,
                'clientHeight': clientHeight
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
        transformProperty = transformVendorInfo.propertyName;

        methods._onSetScrollLeft = function (v) {
            var control = this.control;
            control.contentEl.style[transformProperty] = 'translateX(' + floor(0 - v) + 'px)' +
                ' translateY(' + floor(0 - control.get('scrollTop')) + 'px)' +
                (isTransform3dSupported ? ' translateZ(0)' : '');
        };

        methods._onSetScrollTop = function (v) {
            var control = this.control;
            control.contentEl.style[transformProperty] = 'translateX(' + floor(0 - control.get('scrollLeft')) + 'px)' +
                ' translateY(' + floor(0 - v) + 'px)' +
                (isTransform3dSupported ? ' translateZ(0)' : '');
        };
    }

    return Container.getDefaultRender().extend([ContentRenderExtension],
        methods, {
            name: 'ScrollViewRender'
        });
});