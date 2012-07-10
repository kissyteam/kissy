/*
Copyright 2012, KISSY UI Library v1.30rc
MIT Licensed
build time: Jul 10 10:47
*/
/**
 * @fileOverview 图片放大效果 ImageZoom.
 */
KISSY.add('imagezoom/base', function (S, DOM, Event, UA, Anim, Component, Node, Zoomer, undefined) {
    var IMAGEZOOM_ICON_TMPL = "<span class='{iconClass}'></span>",
        IMAGEZOOM_WRAP_TMPL = "<span class='{wrapClass}'></span>";

    function require(s) {
        return S.require("component/uibase/" + s);
    }

    function show(obj) {
        obj && obj.show();
    }

    function hide(obj) {
        obj && obj.hide();
    }

    return Component.UIBase.extend([
        require("boxrender"),
        require("contentboxrender"),
        require("positionrender"),
        require("loadingrender"),
        UA['ie'] == 6 ? require("shimrender") : null,
        require("align"),
        require("maskrender"),
        Zoomer
    ], {

            initializer:function () {
                var self = this,
                    tmp;

                tmp = self.image = self.get('imageNode');

                // 在小图加载完毕时初始化
                tmp && Zoomer.__imgOnLoad(tmp, function () {
                    if (!self.imageWrap) {
                        self._render();
                        self._bind();
                    }
                });
            },

            destructor:function () {
                var self = this;
                if (self.imageWrap) {
                    self.image.insertBefore(self.imageWrap, undefined);
                    self.imageWrap.remove();
                }
            },

            show:function () {
                this.render();
                this.set("visible", true);
            },

            hide:function () {
                this.set("visible", false);
            },

            _render:function () {
                var self = this,
                    image = self.image;

                self.imageWrap = new Node(S.substitute(IMAGEZOOM_WRAP_TMPL, {
                    wrapClass:self.get('wrapClass')
                })).insertBefore(image, undefined);

                self.imageWrap.prepend(image);

                if (self.get('showIcon')) {
                    self.icon = new Node(S.substitute(IMAGEZOOM_ICON_TMPL, {
                        iconClass:self.get("iconClass")
                    }));
                    self.imageWrap.append(self.icon);
                }
            },

            /**
             * 绑定鼠标进入/离开/移动事件, 只有进入, 才响应鼠标移动事件
             * @private
             */
            _bind:function () {
                var self = this,
                    timer;
                self.image.on('mouseenter',
                    function (ev) {

                        if (!self.get('hasZoom')) {
                            return;
                        }

                        var imageOffset = self.image.offset();

                        self.set("imageLeft", imageOffset.left);
                        self.set("imageTop", imageOffset.top);

                        timer = S.later(function () {
                            self.set('currentMouse', ev);
                            self.show();
                            var align = self.get("align");
                            if (!align.node) {
                                align.node = self.image;
                            }
                            self.__set("align", undefined);
                            self.set("align", align);
                            timer = undefined;
                        }, 50);
                    }).on('mouseleave', function () {
                        if (timer) {
                            timer.cancel();
                            timer = undefined;
                        }
                    });

                self.on('afterVisibleChange', function (ev) {
                    var isVisible = ev.newVal;
                    if (isVisible) {
                        hide(self.icon);
                    } else {
                        show(self.icon);
                    }
                });
            },

            _uiSetHasZoom:function (v) {
                if (v) {
                    show(this.icon);
                } else {
                    hide(this.icon);
                }
            },

            _uiSetImageWidth:function (v) {
                this.image.width(v);
            },

            _uiSetImageHeight:function (v) {
                this.image.height(v);
            }
        },
        {
            ATTRS:{
                imageNode:{
                    setter:function (el) {
                        return Node.one(el);
                    }
                },

                wrapClass:{
                    value:'ks-imagezoom-wrap'
                },

                // width/height 默认和原小图大小保持一致
                width:{
                    valueFn:function () {
                        return this.get("imageWidth");
                    }
                },
                height:{
                    valueFn:function () {
                        return this.get("imageHeight");
                    }
                },

                imageWidth:{
                    valueFn:function () {
                        var img = this.get('imageNode');
                        img = img && img.width();
                        return img || 400;
                    }
                },
                imageHeight:{
                    valueFn:function () {
                        var img = this.get('imageNode');
                        img = img && img.height();
                        return img || 400;
                    }
                },
                imageLeft:{},
                imageTop:{},
                /**
                 * 显示放大区域标志
                 * @type {Boolean}
                 */
                hasZoom:{
                    value:true,
                    setter:function (v) {
                        return !!v;
                    }
                },

                /**
                 * 是否显示放大镜提示图标
                 * @type {Boolean}
                 */
                showIcon:{
                    value:true
                },
                iconClass:{
                    value:'ks-imagezoom-icon'
                },
                prefixCls:{
                    value:'ks-'
                }
            }
        });
}, {
    requires:['dom', 'event', 'ua', 'anim', 'component', 'node', './zoomer']
});


/**
 * NOTES:
 *  20120504 by yiminghe@gmail.com
 *      - refactor
 *      - fix bug: show 前 hasZoom 设了无效
 *
 *  201101 by qiaohua@taobao.com
 *      - 重构代码, 基于 UIBase
 */

/**
 * @fileOverview imagezoom
 * @author qiaohua@taobao.com
 */
KISSY.add("imagezoom", function (S, ImageZoom) {
    return ImageZoom;
}, {requires:[
    "imagezoom/base"
]});

/**
 * yiminghe@gmail.com - 2012.05.04
 *  - simple refactor
 *
 * TODO:
 *  - component refactor
 *//**
 * @fileOverview 图像放大区域
 */
KISSY.add("imagezoom/zoomer", function (S, Node, undefined) {
    var STANDARD = 'standard',
        INNER = 'inner',
        round = Math.round,
        min = Math.min;

    function Zoomer() {
        var self = this,
            tmp;

        if (!self.get("bigImageWidth") || !self.get("bigImageHeight")) {
            S.error("bigImageWidth/bigImageHeight in ImageZoom must be set!");
        }

        // 预加载大图
        tmp = self.get('bigImageSrc');

        if (tmp && self.get('preload')) {
            new Image().src = tmp;
        }

        // 两种显示效果切换标志
        self._isInner = self.get('type') === INNER;
    }

    Zoomer.ATTRS = {

        elCls:{
            value:'ks-imagezoom-viewer'
        },
        /**
         * 显示类型
         * @type {string}
         */
        type:{
            value:STANDARD   // STANDARD  or INNER
        },
        /**
         * 是否预加载大图
         * @type {Boolean}
         */
        preload:{
            value:true
        },

        /**
         * 大图路径, 默认取触点上的 data-ks-imagezoom 属性值
         * @type {string}
         */
        bigImageSrc:{
            valueFn:function () {
                var img = this.get('imageNode');

                if (img) {
                    return img.attr('data-ks-imagezoom');
                }
            }
        },

        /**
         * 大图高宽
         * @type {number}
         */
        bigImageWidth:{},

        bigImageHeight:{},

        /**
         * 保存当前鼠标位置
         */
        currentMouse:{},

        lensClass:{
            value:'ks-imagezoom-lens'
        },

        // 设为属性，缓存结果
        lensHeight:{},
        lensWidth:{},
        lensTop:{},
        lensLeft:{}
    };

    S.augment(Zoomer, {
        __renderUI:function () {
            var self = this,
                contentEl = self.get("contentEl"),
                bigImage;

            bigImage = self.bigImage = new Node('<img ' +
                'src="' +
                self.get("bigImageSrc") +
                '" />')
                .appendTo(contentEl, undefined);

            if (self._isInner) {
                // inner 位置强制修改
                self.set('align', {
                    node:self.image,
                    points:['cc', 'cc']
                });
                self._bigImageCopy = new Node(
                    '<img src="' +
                        self.image.attr('src') +
                        '" width="' +
                        self.get('bigImageWidth')
                        + '" ' +
                        'height="' +
                        self.get('bigImageHeight') +
                        '"' +
                        '/>')
                    .prependTo(contentEl, undefined);
            }
            // 标准模式, 添加镜片
            else {
                self.lens = new Node('<span class="' + self.get("lensClass") + '"></span>')
                    .appendTo(self.imageWrap, undefined).hide();
            }

            self.loading();

            // 大图加载完毕后更新显示区域
            imgOnLoad(bigImage, function () {
                self.unloading();
                if (self._bigImageCopy) {
                    self._bigImageCopy.remove();
                    self._bigImageCopy = null;
                }
            });
        },

        __bindUI:function () {
            var self = this,
                body = S.one("body");
            self.on('afterVisibleChange', function (ev) {
                var isVisible = ev.newVal;
                if (isVisible) {
                    if (self._isInner) {
                        self._anim(0.4);
                    }
                    body.on('mousemove', self._mouseMove, self);
                } else {
                    hide(self.lens);
                    body.detach('mousemove', self._mouseMove, self);
                }
            });
        },

        __destructor:function () {
            var self = this, body = S.one("body");
            body.detach('mousemove', self._mouseMove, self);
        },

        /**
         * 设置镜片大小
         */
        _setLensSize:function () {
            var self = this,
                rw = self.get('width'),
                rh = self.get('height'),
                bw = self.get('bigImageWidth'),
                bh = self.get('bigImageHeight'),
                w = self.get('imageWidth'),
                h = self.get('imageHeight');

            // 考虑放大可视区域，大图，与实际小图
            // 镜片大小和小图的关系相当于放大可视区域与大图的关系
            // 计算镜片宽高, vH / bigImageH = lensH / imageH
            self.set('lensWidth', min(round(w * rw / bw), w));
            self.set('lensHeight', min(round(h * rh / bh), h));
        },
        /**
         * 随着鼠标移动, 设置镜片位置
         * @private
         */
        _setLensOffset:function (ev) {
            var self = this;

            self._setLensSize();

            ev = ev || self.get('currentMouse');

            if (!ev) {
                return;
            }

            var rl = self.get('imageLeft'), rt = self.get('imageTop'),
                rw = self.get('imageWidth'), rh = self.get('imageHeight'),
                lensWidth = self.get('lensWidth'), lensHeight = self.get('lensHeight'),
                lensLeft = ev.pageX - lensWidth / 2, lensTop = ev.pageY - lensHeight / 2;

            if (lensLeft <= rl) {
                lensLeft = rl;
            } else if (lensLeft >= rw + rl - lensWidth) {
                lensLeft = rw + rl - lensWidth;
            }

            if (lensTop <= rt) {
                lensTop = rt;
            } else if (lensTop >= rh + rt - lensHeight) {
                lensTop = rh + rt - lensHeight;
            }
            self.set('lensLeft', lensLeft);
            self.set('lensTop', lensTop);
        },

        _mouseMove:function (ev) {
            var self = this,
                rl = self.get('imageLeft'), rt = self.get('imageTop'),
                rw = self.get('imageWidth'), rh = self.get('imageHeight');

            if (ev.pageX > rl &&
                ev.pageX < rl + rw &&
                ev.pageY > rt &&
                ev.pageY < rt + rh) {
                self.set('currentMouse', ev);
            } else {
                // 移出
                self.hide();
            }
        },

        /**
         * Inner 效果中的放大动画
         * @param {number} seconds
         * @private
         */
        _anim:function (seconds) {
            var self = this,
                rl = self.get('imageLeft'), rt = self.get('imageTop'),
                rw = self.get('imageWidth'), rh = self.get('imageHeight'),
                bw = self.get('bigImageWidth'), bh = self.get('bigImageHeight'),
                max_left = -round((self.get('lensLeft') - rl) * bw / rw),
                max_top = -round((self.get('lensTop') - rt) * bh / rh),
                tmpWidth, tmpHeight;

            self.bigImage.stop();

            // set min width and height
            self.bigImage.css({
                width:rw,
                height:rh,
                left:0,
                top:0
            });

            if (self._bigImageCopy) {
                self._bigImageCopy.css({
                    width:rw,
                    height:rh,
                    left:0,
                    top:0
                });
            }


            tmpWidth = rw + ( bw - rw);
            tmpHeight = rh + (bh - rh);


            self.bigImage.animate({
                width:tmpWidth,
                height:tmpHeight,
                left:max_left,
                top:max_top
            }, seconds);

            if (self._bigImageCopy) {
                self._bigImageCopy.animate({
                    width:tmpWidth,
                    height:tmpHeight,
                    left:max_left,
                    top:max_top
                }, seconds);
            }
        },

        _uiSetCurrentMouse:function (ev) {
            var self = this,
                lt;

            if (!ev ||
                !("pageX" in ev) ||
                !self.bigImage ||
                self.bigImage.isRunning() ||
                !self.get("hasZoom")) {
                return;
            }

            // 更新 lens 位置
            show(self.lens);
            self._setLensOffset(ev);

            // 镜片相对于小图的偏移相当于放大可视区域相对于大图的偏移（即 -(大图相对于放大可视区域的偏移)）
            lt = {

                left:-round((self.get('lensLeft') - self.get('imageLeft')) *
                    self.get('bigImageWidth') / self.get('imageWidth')),


                top:-round((self.get('lensTop') - self.get('imageTop'))
                    * self.get('bigImageHeight') / self.get('imageHeight'))

            };

            self._bigImageCopy && self._bigImageCopy.css(lt);
            self.bigImage.css(lt);
        },

        _uiSetLensWidth:function (v) {
            this.lens && this.lens.width(v);
        },
        _uiSetLensHeight:function (v) {
            this.lens && this.lens.height(v);
        },
        _uiSetLensTop:function (v) {
            this.lens && this.lens.offset({ 'top':v });
        },
        _uiSetLensLeft:function (v) {
            this.lens && this.lens.offset({ 'left':v });
        },

        _uiSetBigImageWidth:function (v) {
            var self = this;
            v && self.bigImage && self.bigImage.width(v);
            v && self._bigImageCopy && self._bigImageCopy.width(v);
        },
        _uiSetBigImageHeight:function (v) {
            var self = this;
            v && self.bigImage && self.bigImage.height(v);
            v && self._bigImageCopy && self._bigImageCopy.height(v);
        },
        _uiSetBigImageSrc:function (v) {
            v && this.bigImage && this.bigImage.attr('src', v);

        },

        /**
         * 改变小图元素的 src
         * @param {String} src
         */
        changeImageSrc:function (src) {
            var self = this;
            self.image.attr('src', src);
            self._uiSetHasZoom(self.get("hasZoom"));
            self.loading();
        }
    });

    function show(obj) {
        obj && obj.show();
    }

    function hide(obj) {
        obj && obj.hide();
    }

    function imgOnLoad(img, callback) {
        var imgElem = img[0];
        // 浏览器缓存时, complete 为 true
        if ((imgElem && imgElem.complete && imgElem.clientWidth)) {
            callback();
            return;
        }
        // 1) 图尚未加载完毕，等待 onload 时再初始化 2) 多图切换时需要绑定load事件来更新相关信息

        imgElem.onload = function () {
            setTimeout(callback, 100);
        }
    }

    Zoomer.__imgOnLoad = imgOnLoad;
    return Zoomer;
}, {
    requires:["node"]
});

/**
 * yiminghe@gmail.com - 2012.05.04
 *  - bigImageWidth/Height must be set!
 */
