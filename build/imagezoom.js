/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: Sep 22 13:54
*/
/**
 * @fileoverview 图像放大区域
 * @author  乔花<qiaohua@taobao.com>
 */
KISSY.add("imagezoom/zoomer", function(S, Node, undefined) {
    var STANDARD = 'standard', INNER = 'inner',
        RE_IMG_SRC = /^.+\.(?:jpg|png|gif)$/i,
        round = Math.round, min = Math.min,
        body;

    function Zoomer() {
        var self = this,
            tmp;

        // 预加载大图
        tmp = self.get('bigImageSrc');
        if (tmp && self.get('preload')) {
            new Image().src = tmp;
        }

        // 两种显示效果切换标志
        self._isInner = self.get('type') === INNER;
        body = new Node(document.body);
    }

    Zoomer.ATTRS = {
        width: {
            valueFn: function() {
                return this.get('imageWidth');
            }
        },
        height: {
            valueFn: function() {
                return this.get('imageHeight');
            }
        },
        elCls: {
            value: 'ks-imagezoom-viewer'
        },
        elStyle: {
            value:  {
                overflow: 'hidden',
                position: 'absolute'
            }
        },


        /**
         * 显示类型
         * @type {string}
         */
        type: {
            value: STANDARD   // STANDARD  or INNER
        },
        /**
         * 是否预加载大图
         * @type {boolean}
         */
        preload: {
            value: true
        },

        /**
         * 大图路径, 默认取触点上的 data-ks-imagezoom 属性值
         * @type {string}
         */
        bigImageSrc: {
            setter: function(v) {
                if (v && RE_IMG_SRC.test(v)) {
                    return v;
                }
                return this.get('bigImageSrc');
            },
            valueFn: function() {
                var img = this.get('imageNode'), data;

                if (img) {
                    data = img.attr('data-ks-imagezoom');
                    if (data && RE_IMG_SRC.test(data)) return data;
                }
                return undefined;
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
         * 大图高宽, 大图高宽是指在没有加载完大图前, 使用这个值来替代计算, 等加载完后会重新更新镜片大小, 具体场景下, 设置个更合适的值
         * @type {number}
         */
        bigImageWidth: {
            valueFn: function() {
                var img = this.bigImage;
                img = img && img.width();
                return img || 800;
            }
        },
        bigImageHeight: {
            valueFn: function() {
                var img = this.bigImage;
                img = img && img.height();
                return img || 800;
            }
        },

        /**
         * 保存当前鼠标位置
         */
        currentMouse: {
            value: undefined
        },
        lensClass: {
            value: 'ks-imagezoom-lens'
        },
        lensHeight: {
            value: undefined
        },
        lensWidth: {
            value: undefined
        },
        lensTop: {
            value: undefined
        },
        lensLeft: {
            value: undefined
        }
    };

    Zoomer.HTML_PARSER = {
    };

    S.augment(Zoomer, {
        __renderUI: function() {
            var self = this, bigImage;

            self.viewer = self.get("contentEl");
            bigImage = self.bigImage = new Node('<img src="' + self.get("bigImageSrc") + '" />').css('position', 'absolute').appendTo(self.viewer);

            self._setLensSize();
            self._setLensOffset();
            
            if (self._isInner) {
                // inner 位置强制修改
                self.set('align', {
                    node: self.image,
                    points: ['cc', 'cc']
                });
                self._bigImageCopy = new Node('<img src="' + self.image.attr('src') + '"  />').css('position', 'absolute')
                    .width(self.get('bigImageWidth')).height(self.get('bigImageHeight')).prependTo(self.viewer);
            }
            // 标准模式, 添加镜片
            else {
                self.lens = new Node('<div class="' + self.get("lensClass") + '"></div>').css('position', 'absolute').appendTo(body).hide();
            }

            self.viewer.appendTo(self.get("el"));

            self.loading();
            // 大图加载完毕后更新显示区域
            imgOnLoad(bigImage, function() {
                self.unloading();
                self._setLensSize();

                self.set('bigImageWidth', bigImage.width());
                self.set('bigImageHeight', bigImage.height());
            });
        },
        __bindUI: function() {
            var self = this;

            self.on('afterVisibleChange', function(ev) {
                var isVisible = ev.newVal;
                if (isVisible) {
                    if (self._isInner) {
                        self._anim(0.4, 42);
                    }
                    body.on('mousemove', self._mouseMove, self);
                } else {
                    hide(self.lens);
                    body.detach('mousemove', self._mouseMove, self);
                }
            });
        },
        __syncUI: function() {
        },

        __destructor: function() {
            var self = this;

            self.viewer.remove();
            self.lens.remove();
        },

        /**
         * 设置镜片大小
         */
        _setLensSize: function() {
            var self = this,
                rw = self.get('imageWidth'), rh = self.get('imageHeight'),
                bw = self.get('bigImageWidth'), bh = self.get('bigImageHeight'),
                w = self.get('width'), h = self.get('height');

            // 计算镜片宽高, vH / bigImageH = lensH / imageH
            self.set('lensWidth', min(round(w * rw / bw), rw));
            self.set('lensHeight', min(round(h * rh / bh), rh));
        },
        /**
         * 随着鼠标移动, 设置镜片位置
         * @private
         */
        _setLensOffset: function(ev) {
            var self = this,
                ev = ev || self.get('currentMouse'),
                rl = self.get('imageLeft'), rt = self.get('imageTop'),
                rw = self.get('imageWidth'), rh = self.get('imageHeight'),
                w = self.get('width'), h = self.get('height'),
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

        _mouseMove: function(ev) {
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
         * @param {number} times
         * @private
         */
        _anim: function(seconds, times) {
            var self = this,
                go, t = 1,
                rl = self.get('imageLeft'), rt = self.get('imageTop'),
                rw = self.get('imageWidth'), rh = self.get('imageHeight'),
                bw = self.get('bigImageWidth'), bh = self.get('bigImageHeight'),
                max_left = - round((self.get('lensLeft') - rl) * bw / rw),
                max_top = - round((self.get('lensTop') - rt) * bh / rh),
                tmpWidth, tmpHeight, tmpCss;

            if (self._animTimer) self._animTimer.cancel();

            // set min width and height
            self.bigImage.width(rw).height(rh);
            self._bigImageCopy.width(rw).height(rh);

            self._animTimer = S.later((go = function() {
                tmpWidth = rw + ( bw - rw) / times * t;
                tmpHeight = rh + (bh - rh) / times * t;
                tmpCss = {
                    left: max_left / times * t,
                    top: max_top / times * t
                };
                self.bigImage.width(tmpWidth).height(tmpHeight).css(tmpCss);
                self._bigImageCopy.width(tmpWidth).height(tmpHeight).css(tmpCss);

                if (++t > times) {
                    self._animTimer.cancel();
                    self._animTimer = undefined;
                }
            }), seconds * 1000 / times, true);

            go();
        },

        _uiSetCurrentMouse: function(ev) {
            var self = this,
                lt;
            if (!self.bigImage || self._animTimer) return;

            // 更新 lens 位置
            show(self.lens);
            self._setLensOffset(ev);

            // 设置大图偏移
            lt = {
                left: - round((self.get('lensLeft') - self.get('imageLeft')) * self.get('bigImageWidth') / self.get('imageWidth')),
                top: - round((self.get('lensTop') - self.get('imageTop')) * self.get('bigImageHeight') / self.get('imageHeight'))
            };
            self._bigImageCopy && self._bigImageCopy.css(lt);
            self.bigImage.css(lt);
        },

        _uiSetLensWidth: function(v) {
            this.lens && this.lens.width(v);
        },
        _uiSetLensHeight: function(v) {
            this.lens && this.lens.height(v);
        },
        _uiSetLensTop: function(v) {
            this.lens && this.lens.offset({ 'top': v });
        },
        _uiSetLensLeft: function(v) {
            this.lens && this.lens.offset({ 'left': v });
        },

        _uiSetBigImageWidth: function(v) {
            v && this.bigImage && this.bigImage.width(v);
            v && this._bigImageCopy && this._bigImageCopy.width(v);
        },
        _uiSetBigImageHeight: function(v) {
            v && this.bigImage && this.bigImage.height(v);
            v && this._bigImageCopy && this._bigImageCopy.height(v);
        },
        _uiSetBigImageSrc: function(v) {
            v && this.bigImage && this.bigImage.attr('src', v);
            v && this._bigImageCopy && this._bigImageCopy.attr('src', v);
        },


        /**
         * 改变小图元素的 src
         * @param {String} src
         */
        changeImageSrc: function(src) {
            var self = this;
            self.image.attr('src', src);
            self.loading();
        },

        /**
         * 调整放大区域位置, 在外部改变小图位置时, 需要对应更新放大区域的位置
         */
        refreshRegion: function() {
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
        if ((imgElem && imgElem.complete && imgElem.clientWidth)) {
            callback();
            return;
        }
        // 1) 图尚未加载完毕，等待 onload 时再初始化 2) 多图切换时需要绑定load事件来更新相关信息
        img.on('load', callback);
    }

    Zoomer.__imgOnLoad = imgOnLoad;
    return Zoomer;
}, {
    requires:["node"]
});/**
 * @fileoverview 图片放大效果 ImageZoom.
 * @author  玉伯<lifesinger@gmail.com>, 乔花<qiaohua@taobao.com>
 * @see silde.html
 */
KISSY.add('imagezoom/base', function(S, DOM, Event, UA, Anim, UIBase, Node, Zoomer, undefined) {
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

    return UIBase.create([require("boxrender"),
        require("contentboxrender"),
        require("positionrender"),
        require("loadingrender"),
        UA['ie'] == 6 ? require("shimrender") : null,
        require("align"),
        require("maskrender"),
        Zoomer
    ], {

        initializer:function() {
            var self = this,
                tmp;

            tmp = self.image = self.get('imageNode');

            // 在小图加载完毕时初始化
            tmp && Zoomer.__imgOnLoad(tmp, function() {
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
        destructor: function() {
            var self = this;

            self.image.detach();
        },

        _render: function() {
            var self = this, wrap,
                image = self.image,
                elem = image.parent();

            if (elem.css('display') !== 'inline') {
                elem = image;
            }
            self.imageWrap = new Node(S.substitute(IMAGEZOOM_WRAP_TMPL, {
                wrapClass: self.get('wrapClass')
            })).insertBefore(elem);
            self.imageWrap.prepend(elem);

            if (self.get('showIcon')) {
                self.icon = new Node(S.substitute(IMAGEZOOM_ICON_TMPL, {
                    iconClass: self.get("iconClass")
                }));
                self.imageWrap.append(self.icon);
            }
        },

        /**
         * 绑定鼠标进入/离开/移动事件, 只有进入, 才响应鼠标移动事件
         * @private
         */
        _bind: function() {
            var self = this,
                timer;

            self.image.on('mouseenter', function(ev) {
                if (!self.get('hasZoom')) return;

                timer = S.later(function() {
                    self.set('currentMouse', ev);
                    if (self._fresh) {
                        self.set('align', self._fresh);
                        self._fresh = undefined;
                    }
                    self.show();
                    timer = undefined;
                }, 50);
            }).on('mouseleave', function() {
                if (timer) {
                    timer.cancel();
                    timer = undefined;
                }
            });

            self.on('afterVisibleChange', function(ev) {
                var isVisible = ev.newVal;
                if (isVisible) {
                    hide(self.icon);
                } else {
                    show(self.icon);
                }
            });
        },

        _uiSetHasZoom: function(v) {
            if (v) {
                show(this.icon);
            } else {
                hide(this.icon);
            }
        }
    },
    {
        ATTRS:{
            imageNode: {
                setter: function(el) {
                    return Node.one(el);
                }
            },
            wrapClass: {
                value: 'ks-imagezoom-wrap'
            },
            imageWidth: {
                valueFn: function() {
                    var img = this.get('imageNode');
                    img = img && img.width();
                    return img || 400;
                }
            },
            imageHeight: {
                valueFn: function() {
                    var img = this.get('imageNode');
                    img = img && img.height();
                    return img || 400;
                }
            },
            imageLeft: {
                valueFn: function() {
                    var img = this.get('imageNode');
                    img = img && img.offset().left;
                    return img || 400;
                }
            },
            imageTop: {
                valueFn: function() {
                    var img = this.get('imageNode');
                    img = img && img.offset().top;
                    return img || 400;
                }
            },
            /**
             * 显示放大区域标志
             * @type {boolean}
             */
            hasZoom: {
                value: true,
                setter: function(v) {
                    return !!v;
                }
            },

            /**
             * 是否显示放大镜提示图标
             * @type {boolean}
             */
            showIcon: {
                value: true
            },
            iconClass: {
                value: 'ks-imagezoom-icon'
            },
            prefixCls:{
                value: 'ks-'
            }
        }
    });
}, {
    requires: ['dom','event', 'ua', 'anim', 'uibase', 'node', 'imagezoom/zoomer']
});


/**
 * NOTES:
 *  201101
 *      - 重构代码, 基于 UIBase
 *
 */

/**
 * auto render
 * @author  玉伯<lifesinger@gmail.com>
 */
KISSY.add('imagezoom/autorender', function(S, DOM, JSON, ImageZoom) {

    /**
     * 自动渲染 container 元素内的所有 ImageZoom 组件
     * 默认钩子：<div class="KS_Widget" data-widget-type="ImageZoom" data-widget-config="{...}">
     *
     */
    ImageZoom.autoRender = function(hook, container) {
        hook = '.' + (hook || 'KS_Widget');

        DOM.query(hook, container).each(function(elem) {
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
KISSY.add("imagezoom", function(S, ImageZoom) {
    S.ImageZoom = ImageZoom;
    return ImageZoom;
}, {requires:[
    "imagezoom/base",
    "imagezoom/autorender"
]});
