/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 4 13:50
*/
/**
 * @fileOverview auto render
 * @author lifesinger@gmail.com
 */
KISSY.add('imagezoom/autorender', function(S, DOM, JSON, ImageZoom) {

    /**
     * 自动渲染 container 元素内的所有 ImageZoom 组件
     * 默认钩子：<div class="KS_Widget" data-widget-type="ImageZoom" data-widget-config="{...}">
     *
     */
    ImageZoom.autoRender = function(hook, container) {
        hook = '.' + (hook || 'KS_Widget');

        S.each(DOM.query(hook, container),function(elem) {
            var type = elem.getAttribute('data-widget-type'), config;

            if (type === 'ImageZoom') {
                try {
                    config = elem.getAttribute('data-widget-config');
                    if (config) config = config.replace(/'/g, '"');
                    new ImageZoom(elem, JSON.parse(config));
                }
                catch(ex) {
                    S.log('ImageZoom.autoRender: ' + ex, 'warn');
                }
            }
        });
    };

}, { requires:["dom","json","imagezoom/base"] });
/**
 * @fileOverview 图片放大效果 ImageZoom.
 * @author lifesinger@gmail.com, qiaohua@taobao.com
 */
KISSY.add('imagezoom/base', function (S, DOM, Event, UA, Anim, UIBase, Node, Zoomer, undefined) {
    var IMAGEZOOM_ICON_TMPL = "<span class='{iconClass}'></span>",
        IMAGEZOOM_WRAP_TMPL = "<div class='{wrapClass}'></div>";

    function require(s) {
        return S.require("uibase/" + s);
    }

    function show(obj) {
        obj && obj.show();
    }

    function hide(obj) {
        obj && obj.hide();
    }

    return UIBase.create([
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

            /*renderUI:function() {
             },
             syncUI:function() {
             },
             bindUI: function() {
             },*/
            destructor:function () {
                var self = this;
                self.image.detach();
            },

            show:function () {
                this.render();
                this.set("visible", true);
            },

            hide:function () {
                this.set("visible", false);
            },

            _render:function () {
                var self = this, wrap,
                    image = self.image,
                    elem = image.parent();

                if (elem.css('display') !== 'inline') {
                    elem = image;
                }
                self.imageWrap = new Node(S.substitute(IMAGEZOOM_WRAP_TMPL, {
                    wrapClass:self.get('wrapClass')
                })).insertBefore(elem);
                self.imageWrap.prepend(elem);

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

                        if (timer) {
                            return;
                        }

                        if (!self.get('hasZoom')) {
                            return;
                        }

                        timer = S.later(function () {
                            self.set('currentMouse', ev);
                            if (self._fresh) {
                                self.set('align', self._fresh);
                                self._fresh = undefined;
                            }
                            self.show();
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
                imageLeft:{
                    valueFn:function () {
                        var img = this.get('imageNode');
                        img = img && img.offset().left;
                        return img || 400;
                    }
                },
                imageTop:{
                    valueFn:function () {
                        var img = this.get('imageNode');
                        img = img && img.offset().top;
                        return img || 400;
                    }
                },
                /**
                 * 显示放大区域标志
                 * @type {boolean}
                 */
                hasZoom:{
                    value:true,
                    setter:function (v) {
                        return !!v;
                    }
                },

                /**
                 * 是否显示放大镜提示图标
                 * @type {boolean}
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
    requires:['dom', 'event', 'ua', 'anim', 'uibase', 'node', './zoomer']
});


/**
 * NOTES:
 *  201101
 *      - 重构代码, 基于 UIBase
 *
 */

/**
 * @fileOverview imagezoom
 * @author qiaohua@taobao.com
 */
KISSY.add("imagezoom", function(S, ImageZoom) {
    return ImageZoom;
}, {requires:[
    "imagezoom/base",
    "imagezoom/autorender"
]});/**
 * @fileOverview 图像放大区域
 * @author qiaohua@taobao.com, yiminghe@gmail.com
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
        elStyle:{
            value:{
                overflow:'hidden',
                position:'absolute'
            }
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
         * @type {boolean}
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
         * 大图高宽, 大图高宽是指在没有加载完大图前, 使用这个值来替代计算, 等加载完后会重新更新镜片大小, 具体场景下, 设置个更合适的值
         * @type {Array.<number>}

         bigImageSize: {
         value: [800, 800],
         setter: function(v) {
         this.set('bigImageWidth', v[0]);
         this.set('bigImageHeight', v[1]);
         return v;
         }
         },*/
        /**
         * 大图高宽
         * @type {number}
         */
        bigImageWidth:{  },

        bigImageHeight:{},

        /**
         * 保存当前鼠标位置
         */
        currentMouse:{
            value:undefined
        },
        lensClass:{
            value:'ks-imagezoom-lens'
        },
        lensHeight:{},
        lensWidth:{},
        lensTop:{},
        lensLeft:{}
    };

    Zoomer.HTML_PARSER = {
    };

    S.augment(Zoomer, {
        __renderUI:function () {
            var self = this,
                bigImage;

            self.viewer = self.get("contentEl");
            bigImage = self.bigImage = new Node('<img src="' +
                self.get("bigImageSrc") +
                '" />')
                .css('position', 'absolute')
                .appendTo(self.viewer, undefined);

            self._setLensSize();
            self._setLensOffset();

            if (self._isInner) {
                // inner 位置强制修改
                self.set('align', {
                    node:self.image,
                    points:['cc', 'cc']
                });
                self._bigImageCopy = new Node(
                    '<img src="' + self.image.attr('src') + '" width="' +
                        self.get('bigImageWidth')
                        + '" ' +
                        'height="' +
                        self.get('bigImageHeight') +
                        '"' +
                        '/>')
                    .css('position', 'absolute')
                    .prependTo(self.viewer, undefined);
            }
            // 标准模式, 添加镜片
            else {
                self.lens = new Node('<div class="' + self.get("lensClass") + '"></div>')
                    .css('position', 'absolute').appendTo(S.one("body"), undefined).hide();
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
        __syncUI:function () {
        },

        __destructor:function () {
            var self = this;
            self.lens.remove();
        },

        /**
         * 设置镜片大小
         */
        _setLensSize:function () {
            var self = this,
                rw = self.get('imageWidth'), rh = self.get('imageHeight'),
                bw = self.get('bigImageWidth'), bh = self.get('bigImageHeight'),
                w = self.get('imageWidth'), h = self.get('imageHeight');

            // 计算镜片宽高, vH / bigImageH = lensH / imageH
            self.set('lensWidth', min(round(w * rw / bw), rw));
            self.set('lensHeight', min(round(h * rh / bh), rh));
        },
        /**
         * 随着鼠标移动, 设置镜片位置
         * @private
         */
        _setLensOffset:function (ev) {
            var self = this;

            ev = ev || self.get('currentMouse');
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

            if (ev.pageX > rl && ev.pageX < rl + rw &&
                ev.pageY > rt && ev.pageY < rt + rh) {
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
            if (!self.bigImage || self.bigImage.isRunning()) {
                return;
            }

            // 更新 lens 位置
            show(self.lens);
            self._setLensOffset(ev);

            // 设置大图偏移
            lt = {

                // fix #128
                left:Math.max(-round((self.get('lensLeft') - self.get('imageLeft')) *
                    self.get('bigImageWidth') / self.get('imageWidth'))
                    , self.get("width") - self.get('bigImageWidth')),

                top:Math.max(-round((self.get('lensTop') - self.get('imageTop'))
                    * self.get('bigImageHeight') / self.get('imageHeight')),
                    self.get("height") - self.get('bigImageHeight'))

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
            v && this.bigImage && this.bigImage.width(v);
            v && this._bigImageCopy && this._bigImageCopy.width(v);
        },
        _uiSetBigImageHeight:function (v) {
            v && this.bigImage && this.bigImage.height(v);
            v && this._bigImageCopy && this._bigImageCopy.height(v);
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
            self.loading();
        },

        /**
         * 调整放大区域位置, 在外部改变小图位置时, 需要对应更新放大区域的位置
         */
        refreshRegion:function () {
            var self = this;

            self._fresh = self.get('align');
            self.set('align', undefined);
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
        /*        img.on('load', function() {
         setTimeout(callback, 100);
         });*/

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
