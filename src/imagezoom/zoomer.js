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
                S.log([bigImage[0].complete,  bigImage.width()]);
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
            var self = this;

            ev = ev || self.get('currentMouse');
            var rl = self.get('imageLeft'), rt = self.get('imageTop'),
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
        // 浏览器缓存时, complete 为 true
        if ((imgElem && imgElem.complete && imgElem.clientWidth)) {
            callback();
            return;
        }
        // 1) 图尚未加载完毕，等待 onload 时再初始化 2) 多图切换时需要绑定load事件来更新相关信息
/*        img.on('load', function() {
            setTimeout(callback, 100);
        });*/

        imgElem.onLoad = function() {
            setTimeout(callback, 100);
        }
    }

    Zoomer.__imgOnLoad = imgOnLoad;
    return Zoomer;
}, {
    requires:["node"]
});