/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:21
*/
/**
 * @ignore
 * ImageZoom.
 * @author yiminghe@gmail.com, qiaohua@taobao.com
 */
KISSY.add('imagezoom', function (S, Node, Overlay, Zoomer, undefined) {
    var $ = Node.all,
        doc = $(S.Env.host.document),
        IMAGEZOOM_ICON_TMPL = "<span class='{iconClass}'></span>",
        undefinedNode = /**
         @ignore
         @type Node
         */undefined,
        IMAGEZOOM_WRAP_TMPL = "<span class='{wrapClass}'></span>",
        STANDARD = 'standard',
        groupEventForInnerAnim = '.ks-imagezoom-img-mouse',
        INNER = 'inner',
        ABSOLUTE_STYLE = ' style="position:absolute;top:-9999px;left:-9999px;" ',
        BIG_IMG_TPL = '<img src=' + '{src} {style} />';

    function constrain(v, l, r) {
        return Math.min(Math.max(v, l), r);
    }

    /**
     * image zoomer for kissy
     * @class KISSY.ImageZoom
     * @extends KISSY.Overlay
     */
    var ImageZoom = Overlay.extend({

            initializer: function () {
                var self = this;

                if (!self.get("bigImageWidth") || !self.get("bigImageHeight")) {

                }

                imageZoomRenderUI(self);
                imageZoomBindUI(self);
            },

            renderUI: function () {
                var self = this,
                    image = self.get('imageNode'),
                    contentEl = self.get("contentEl");

                self.bigImage = $(S.substitute(BIG_IMG_TPL, {
                    src: self.get("bigImageSrc"),
                    style: ABSOLUTE_STYLE
                })).appendTo(contentEl, undefined);

                self.bigImageCopy = $(S.substitute(BIG_IMG_TPL, {
                    src: image.attr('src'),
                    style: ABSOLUTE_STYLE
                })).prependTo(contentEl, undefined);

                if (self.get('type') != INNER) {
                    self.lens = $('<span ' +
                        ABSOLUTE_STYLE +
                        ' class="' + self.get('prefixCls') + 'imagezoom-lens' + '"></span>')
                        .appendTo(self.imageWrap, undefined);
                }
            },

            bindUI: function () {
                var self = this;
                self.on('hide', onZoomerHide, self);
            },

            destructor: function () {
                var self = this,
                    img = self.get('imageNode'),
                    imageWrap;

                onZoomerHide.call(self);

                if (imageWrap = self.imageWrap) {
                    img.insertBefore(imageWrap, undefinedNode);
                    imageWrap.remove();
                }

                img.detach('mouseenter', self.__onImgEnter);
            },

            '_onSetBigImageWidth': function (v) {
                var self = this;
                self.bigImage.width(v);
                self.bigImageCopy.width(v);
            },

            '_onSetBigImageHeight': function (v) {
                var self = this;
                self.bigImage.height(v);
                self.bigImageCopy.height(v);
            },

            '_onSetBigImageSrc': function (v) {
                this.bigImage.attr('src', v);
            },

            '_onSetCurrentMouse': function (currentMouse) {
                var self = this,
                    lensLeft,
                    lensTop,
                    pageX = currentMouse.pageX,
                    pageY = currentMouse.pageY,
                    lens = self.lens,
                    bigImageOffset;

                // inner 动画中
                if (self.bigImage.isRunning()) {
                    return;
                }

                // 更新 lens 位置
                if (lens) {
                    lensLeft = pageX - self.lensWidth / 2;
                    lensTop = pageY - self.lensHeight / 2;
                    lens.offset({
                        left: self.lensLeft = constrain(lensLeft, self.minLensLeft, self.maxLensLeft),
                        top: self.lensTop = constrain(lensTop, self.minLensTop, self.maxLensTop)
                    });
                }

                // note: 鼠标点对应放大点在中心位置
                bigImageOffset = getBigImageOffsetFromMouse(self, currentMouse);

                self.bigImageCopy.css(bigImageOffset);
                self.bigImage.css(bigImageOffset);
            }
        },
        {
            ATTRS: {
                /**
                 * existing image node needed to be zoomed.
                 * @cfg {HTMLElement|String} imageNode
                 */
                /**
                 * @ignore
                 */
                imageNode: {
                    setter: function (el) {
                        return Node.one(el);
                    }
                },

                /**
                 * existing image node's src.
                 * @type {String}
                 * @property imageSrc
                 */
                /**
                 * @ignore
                 */
                imageSrc: {
                    valueFn: function () {
                        return this.get('imageNode').attr('src');
                    }
                },

                /**
                 * zoomed overlay width
                 * Defaults to imageNode's width.
                 * @cfg {Number} width
                 */
                /**
                 * @ignore
                 */
                width: {
                    valueFn: function () {
                        return this.get("imageNode").width();
                    }
                },
                /**
                 * zoomed overlay height
                 * Defaults to imageNode's height.
                 * @cfg {Number} height
                 */
                /**
                 * @ignore
                 */
                height: {
                    valueFn: function () {
                        return this.get("imageNode").height();
                    }
                },
                /**
                 * whether to allow imageNode zoom
                 * @cfg {Boolean} hasZoom
                 */
                /**
                 * whether to allow imageNode zoom
                 * @type {Boolean}
                 * @property hasZoom
                 */
                /**
                 * @ignore
                 */
                hasZoom: {
                    value: true,
                    setter: function (v) {
                        return !!v;
                    }
                },


                /**
                 * type of zooming effect
                 * @cfg {KISSY.ImageZoom.ZoomType} type
                 */
                /**
                 * @ignore
                 */
                type: {
                    value: STANDARD   // STANDARD  or INNER
                },


                /**
                 * big image src.
                 * Default to: value of imageNode's **data-ks-imagezoom** attribute value
                 * @cfg {string} bigImageSrc
                 */
                /**
                 * big image src.
                 * @type {string}
                 * @property bigImageSrc
                 */
                /**
                 * @ignore
                 */
                bigImageSrc: {
                    valueFn: function () {
                        return  this.get('imageNode').attr('data-ks-imagezoom');
                    }
                },


                /**
                 * width of big image
                 * @cfg {Number} bigImageWidth
                 */
                /**
                 * width of big image
                 * @type {Number}
                 * @property bigImageWidth
                 */
                /**
                 * @ignore
                 */
                bigImageWidth: {},


                /**
                 * height of big image
                 * @cfg {Number} bigImageHeight
                 */
                /**
                 * height of big image
                 * @type {Number}
                 * @property bigImageHeight
                 */
                /**
                 * @ignore
                 */
                bigImageHeight: {},

                /**
                 * current mouse position
                 * @private
                 * @property currentMouse
                 */
                /**
                 * @ignore
                 */
                currentMouse: {}
            }
        }, {
            xclass: 'imagezoom-viewer'
        });


    // # -------------------------- private start

    function setZoomerPreShowSession(self) {
        var img = self.get('imageNode'),
            imageOffset = img.offset(),
            imageLeft,
            imageWidth,
            imageHeight,
            zoomMultipleH,
            zoomMultipleW,
            lensWidth,
            lensHeight,
            bigImageWidth = self.get('bigImageWidth'),
            bigImageHeight = self.get('bigImageHeight'),
            width = self.get('width'),
            height = self.get('height'),
            align,
            originNode,
            imageTop;

        imageLeft = self.imageLeft = imageOffset.left;
        imageTop = self.imageTop = imageOffset.top;
        imageWidth = self.imageWidth = img.width();
        imageHeight = self.imageHeight = img.height();
        zoomMultipleH = self.zoomMultipleH = bigImageHeight / imageHeight;
        zoomMultipleW = self.zoomMultipleW = bigImageWidth / imageWidth;
        // 考虑放大可视区域，大图，与实际小图
        // 镜片大小和小图的关系相当于放大可视区域与大图的关系
        // 计算镜片宽高, vH / bigImageH = lensH / imageH
        lensWidth = self.lensWidth = width / zoomMultipleW;
        lensHeight = self.lensHeight = height / zoomMultipleH;
        self.minLensLeft = imageLeft;
        self.minLensTop = imageTop;
        self.maxLensTop = imageTop + imageHeight - lensHeight;
        self.maxLensLeft = imageLeft + imageWidth - lensWidth;
        self.maxBigImageLeft = 0;
        self.maxBigImageTop = 0;
        self.minBigImageLeft = -(bigImageWidth - width);
        self.minBigImageTop = -(bigImageHeight - height);

        if (self.get('type') === INNER) {
            // inner 位置强制修改
            self.set('align', {
                node: img,
                points: ['cc', 'cc']
            });
        } else {
            align = self.get("align") || {};
            originNode = align.node;
            delete align.node;
            align = S.clone(align);
            align.node = originNode || img;
            self.set("align", align);
        }
        self.icon.hide();
        doc.on('mousemove mouseleave', onMouseMove, self);
    }

    function onZoomerHide() {
        var self = this,
            lens = self.lens;
        doc.detach('mousemove mouseleave', onMouseMove, self);
        self.icon.show();
        if (lens) {
            lens.hide();
        }
    }

    function imageZoomRenderUI(self) {
        var imageWrap,
            icon,
            image = self.get('imageNode');

        imageWrap = self.imageWrap = $(S.substitute(IMAGEZOOM_WRAP_TMPL, {
            wrapClass: self.get('prefixCls') + 'imagezoom-wrap'
        })).insertBefore(image, undefinedNode);

        imageWrap.prepend(image);
        icon = self.icon = $(S.substitute(IMAGEZOOM_ICON_TMPL, {
            iconClass: self.get('prefixCls') + 'imagezoom-icon'
        }));
        imageWrap.append(icon);
    }


    function imageZoomBindUI(self) {
        var img = self.get('imageNode'),
            currentMouse,
            type = self.get('type'),
            commonFn = (function () {
                var buffer;

                function t() {
                    if (buffer) {
                        return;
                    }
                    buffer = S.later(function () {
                        buffer = 0;
                        detachImg(img);
                        setZoomerPreShowSession(self);
                        self.show();
                        // after create lens
                        self.lens.show()
                            .css({
                                width: self.lensWidth,
                                height: self.lensHeight
                            });
                        self.set('currentMouse', currentMouse);
                    }, 50);
                }

                t.stop = function () {
                    buffer.cancel();
                    buffer = 0;
                };

                return t;
            })(),
        // prevent flash of content for inner anim
            innerFn = S.buffer(function () {
                detachImg(img);
                setZoomerPreShowSession(self);
                self.show();
                animForInner(self, 0.4, currentMouse);
            }, 50),
            fn = type == 'inner' ? innerFn : commonFn;

        img.on('mouseenter', self.__onImgEnter = function (ev) {
            if (self.get('hasZoom')) {
                currentMouse = ev;
                img.on('mousemove' + groupEventForInnerAnim,function (ev) {
                    currentMouse = ev;
                    fn();
                }).on('mouseleave' + groupEventForInnerAnim, function () {
                        fn.stop();
                        detachImg(img);
                    });
                fn();
            }
        });

        self.on('afterImageSrcChange', onImageZoomSetImageSrc, self);
        self.on('afterHasZoomChange', onImageZoomSetHasZoom, self);

        onImageZoomSetHasZoom.call(self, {newVal: self.get('hasZoom')});
    }

    function detachImg(img) {
        img.detach('mouseleave' + groupEventForInnerAnim);
        img.detach('mousemove' + groupEventForInnerAnim);
    }

    function onMouseMove(ev) {
        var self = this,
            rl = self.imageLeft,
            rt = self.imageTop,
            rw = self.imageWidth,
            pageX = ev.pageX,
            pageY = ev.pageY,
            rh = self.imageHeight;
        if (String(ev.type) == 'mouseleave') {
            self.hide();
            return;
        }
        if (pageX > rl && pageX < rl + rw &&
            pageY > rt && pageY < rt + rh) {
            self.set('currentMouse', {
                pageX: pageX,
                pageY: pageY
            });
        } else {
            self.hide();
        }
    }

    // Inner 效果中的放大动画
    function animForInner(self, seconds, currentMouse) {
        var bigImages = self.bigImage;

        bigImages.add(self.bigImageCopy);

        bigImages.stop();

        // set min width and height
        bigImages.css({
            width: self.imageWidth,
            height: self.imageHeight,
            left: 0,
            top: 0
        });

        bigImages.animate(S.mix({
            width: self.get('bigImageWidth'),
            height: self.get('bigImageHeight')
        }, getBigImageOffsetFromMouse(self, currentMouse)), seconds);
    }

    function onImageZoomSetHasZoom(e) {
        this.icon[e.newVal ? 'show' : 'hide']();
    }

    function onImageZoomSetImageSrc(e) {
        var src = e.newVal,
            self = this,
            bigImageCopy;
        self.get('imageNode').attr('src', src);
        if (bigImageCopy = self.bigImageCopy) {
            bigImageCopy.attr('src', src);
        }
    }

    function getBigImageOffsetFromMouse(self, currentMouse) {
        var width = self.get('width'),
            height = self.get('height');
        return {
            left: constrain(-(currentMouse.pageX - self.imageLeft)
                * self.zoomMultipleW + width / 2, self.minBigImageLeft, self.maxBigImageLeft),
            top: constrain(-(currentMouse.pageY - self.imageTop)
                * self.zoomMultipleH + height / 2, self.minBigImageTop, self.maxBigImageTop)
        };
    }


    // # -------------------------- private end

    /**
     * zoom mode for imagezoom
     * @enum {String} KISSY.ImageZoom.ZoomType
     */
    ImageZoom.ZoomType = {
        /**
         * zoom overlay is beside imageNode
         */
        STANDARD: 'standard',
        /**
         * zoom overlay covers imageNode
         */
        INNER: 'inner'
    };

    return ImageZoom;

}, {
    requires: ['node', 'overlay']
});


/**
 * @ignore
 * NOTES:
 * 2012-12-17 yiminghe@gmail.com
 *  - refactor and document
 *  - TODO extend overlay ?? confused
 *
 * 20120504 by yiminghe@gmail.com
 *  - refactor
 *  - fix bug: show 前 hasZoom 设了无效
 *
 * 201101 by qiaohua@taobao.com
 *  - 重构代码, 基于 UIBase
 */

