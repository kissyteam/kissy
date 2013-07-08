/**
 * scroll-view render
 * @author yiminghe@gmail.com
 */
KISSY.add('scroll-view/base/render', function (S, Node, Container, ContentRenderExtension) {

    // http://www.html5rocks.com/en/tutorials/speed/html5/
    var Features = S.Features,
        $ = Node.all,
        supportCss3 = Features.isTransformSupported(),
        transformProperty;

    var methods = {
        syncUI: function () {
            var self = this,
                control = self.control,
                el = control.el,
                contentEl = control.contentEl,
                $contentEl = control.$contentEl,
            // consider pull to refresh
            // refresh label will be prepended to el
            // contentEl must be absolute
            // or else
            // relative is weird, should math.max(contentEl.scrollHeight,el.scrollHeight)
            // will affect pull to refresh
                scrollHeight = contentEl.scrollHeight,
                scrollWidth = contentEl.scrollWidth,
                clientHeight = el.clientHeight,
                allowScroll,
                clientWidth = el.clientWidth;

            control.scrollHeight = scrollHeight;
            control.scrollWidth = scrollWidth;
            control.clientHeight = clientHeight;
            control.clientWidth = clientWidth;

            var elOffset = $contentEl.offset();

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

            var elDoc = $(el.ownerDocument);

            control.scrollStep = {
                top: Math.max(clientHeight * clientHeight * 0.7 / elDoc.height(), 20),
                left: Math.max(clientWidth * clientWidth * 0.7 / elDoc.width(), 20)
            };

            var snap = control.get('snap'),
                scrollLeft = control.get('scrollLeft'),
                scrollTop = control.get('scrollTop');

            if (snap) {
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
            control.contentEl.style[transformProperty] =
                'translate3d(' + -v + 'px,' + -control.get('scrollTop') + 'px,0)';
        };

        methods._onSetScrollTop = function (v) {
            var control = this.control;
            control.contentEl.style[transformProperty] =
                'translate3d(' + -control.get('scrollLeft') + 'px,' + -v + 'px,0)';
        };
    }

    return Container.ATTRS.xrender.value.extend([ContentRenderExtension],
        methods, {
            name: 'ScrollViewRender'
        });

}, {
    requires: ['node',
        'component/container',
        'component/extension/content-render']
});