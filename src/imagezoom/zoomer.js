/**
 * @fileoverview 图像放大区域
 * @author  乔花<qiaohua@taobao.com>
 */
KISSY.add("imagezoom/zoomer", function(S, Node, undefined) {
    var doc = document,
        STANDARD = 'standard', INNER = 'inner',
        RE_IMG_SRC = /^.+\.(?:jpg|png|gif)$/i,
        round = Math.round, min = Math.min,
        SRC = 'src', MOUSEMOVE = 'mousemove';


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

    }

    Zoomer.ATTRS = {
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
        bigImageNode: {
            setter: function(el) {
                return Node.one(el);
            }
        },
        /**
         * 大图高宽, 大图高宽是指在没有加载完大图前, 使用这个值来替代计算, 等加载完后会重新更新镜片大小, 具体场景下, 设置个更合适的值
         * @type {number}
         */
        bigImageWidth: {
            valueFn: function() {
                var img = this.get('bigImageNode');
                img = img && img.clientWidth;
                return img || 800;
            }
        },
        bigImageHeight: {
            valueFn: function() {
                var img = this.get('bigImageNode');
                img = img && img.clientWidth;
                return img || 800;
            }
        },
        lensClass: {
            value: 'ks-imagezoom-lens'
        },
        /**
         * 放大区域宽高
         * @type {number}
         */
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
        /**
         * 放大区域样式
         * @type {string}
         */
        viewerClass: {
            value: 'ks-imagezoom-viewer'
        }
    };

    S.augment(Zoomer, {
        __renderUI: function() {
            var self = this;


            /**
             * 大图显示区域
             * @type {Element}
             */
            self.viewer = new Node('<div class="' + self.get("viewerClass") + '"></div>');
            self.bigImage = new Node('<img src="' + self.get("bigImageSrc") + ' />');
            self.set('bigImageNode', self.bigImage);
            self.viewer.append(self.bigImage);

            if (self._isInner) {
                self._bigImageCopy = new Node('<img src="' + self.image.attr('src') + "' style='width: " + self.get('bigImageWidth') +
                                                "px;height:" + self.get('bigImageHeight') + "px;' />");
                self.viewer.prepend(self._bigImageCopy);
            }
            // 标准模式, 添加镜片
            else {
                self.lens = new Node('<div class="' + self.get("lensClass") + '"></div>').appendTo(doc.body);
                var lensWH = self._getLensSize();
                self.lens.width(lensWH[0]).height(lensWH[1]);
            }
            self.viewer.appendTo(self.get("contentEl"));

            // 大图加载完毕后更新显示区域
            /*imgOnLoad(self.bigImage, function() {
                self._setViewerRegion();
            });*/
        },
        __bindUI: function() {
            var self = this;

            /*var align = {
                node: self.imageWrap,
                points: ["tr","tl"]
            };*/
            self.on('show', function() {
                //self.align(align.node, align.points);

                self.icon.hide();

                self.viewer.show();
                if (self._isInner) {
                    self._anim(0.4, 42);
                } else {
                    self.lens.show();
                    self._onMouseMove();
                }

                Event.on(doc.body, MOUSEMOVE, self._onMouseMove, self);
            });


            self.on('hide', function() {
                var self = this;

                self.lens.hide();
                self.viewer.hide();
                self.icon.show();

                Event.remove(doc.body, MOUSEMOVE, self._onMouseMove, self);
            });
        },
        __syncUI: function() {
        },

        __destructor: function() {
            var self = this;

            self.viewer.detach();
            self.viewer.remove();

            self.lens.detach();
            self.lens.remove();
        },
        

        /**
         * 计算镜片宽高
         */
        _getLensSize: function() {
            var self = this,
                rw = self.get('imageWidth'), rh = self.get('imageHeight'),
                bw = self.get('bigImageWidth'), bh = self.get('bigImageHeight'),
                w = self.get('width'), h = self.get('height'),
                lensWidth, lensHeight;

            // 计算镜片宽高, vH / bigImageH = lensH / imageH
            lensWidth = min(round(w * rw / bw), rw);
            lensHeight = min(round(h * rh / bh), rh);

            // 镜片宽高, 随大图宽高变化而变化
            return [lensWidth, lensHeight];
        },

        /**
         * 鼠标移动时, 更新放大区域的显示
         * @private
         */
        _onMouseMove: function() {
            var self = this,
                lens = self.lens, ev = self._ev,
                rl = self.get('imageLeft'), rt = self.get('imageTop'),
                rw = self.get('imageWidth'), rh = self.get('imageHeight'),
                bw = self.get('bigImageWidth'), bh = self.get('bigImageHeight'),
                lensOffset;

            if (ev.pageX > rl && ev.pageX < rl + rw &&
                ev.pageY > rt && ev.pageY < rt + rh) {

                // 动画时阻止移动
                if (self._isInner && self._animTimer) return;

                lensOffset = self._getLensOffset();
                // 更新 lens 位置
                if (!self._isInner && lens) DOM.offset(lens, lensOffset);

                // 设置大图偏移
                DOM.css([self._bigImageCopy, self.bigImage], {
                    left: - round((lensOffset.left - rl) * bw / rw),
                    top: - round((lensOffset.top - rt) * bh / rh)
                });
            } else {
                self.hide();
            }
        },

        /**
         * 随着鼠标移动, 获取镜片位置
         * @private
         */
        _getLensOffset: function() {
            var self = this,
                ev = self._ev,
                rl = self.get('imageLeft'), rt = self.get('imageTop'),
                rw = self.get('imageWidth'), rh = self.get('imageHeight'),
                lensSize = self._getLensSize(),
                lensW = lensSize[0], lensH = lensSize[1],
                lensLeft = ev.pageX - lensW / 2,
                lensTop = ev.pageY - lensH / 2;

            if (lensLeft <= rl) {
                lensLeft = rl;
            } else if (lensLeft >= rw + rl - lensW) {
                lensLeft = rw + rl - lensW;
            }

            if (lensTop <= rt) {
                lensTop = rt;
            } else if (lensTop >= rh + rt - lensH) {
                lensTop = rh + rt - lensH;
            }
            return { left: lensLeft, top: lensTop };
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
                img = [self.bigImage, self._bigImageCopy],
                lensOffset = self._getLensOffset(),
                max_left = - round((lensOffset.left - rl) * bw / rw),
                max_top = - round((lensOffset.top - rt) * bh / rh);

            if (self._animTimer) self._animTimer.cancel();

            // set min width and height
            setWidthHeight(img, rw, rh);
            self._animTimer = S.later((go = function() {
                setWidthHeight(img, rw + ( bw - rw) / times * t, rh + (bh - rh) / times * t);
                // 定位到鼠标点
                DOM.css(img, {
                    left: max_left / times * t,
                    top: max_top / times * t
                });

                if (++t > times) {
                    self._animTimer.cancel();
                    self._animTimer = undefined;
                }
            }), seconds * 1000 / times, true);

            go();
        },

        /**
         * 检查是否改变了大图的 src
         * @private
         */
        _checkBigImageSrc: function() {
            var self = this,
                bigImageSrc = self.get(BIG_IMAGE_SRC);

            if (self._cacheBigImageSrc && (self._cacheBigImageSrc !== bigImageSrc)) {
                DOM.attr(self.bigImage, SRC, bigImageSrc);
                self._cacheBigImageSrc = bigImageSrc;
                if (self._isInner) DOM.attr(self._bigImageCopy, SRC, DOM.attr(self.image, SRC));
            }
        },


        /**
         * 调整放大区域位置, 在外部改变小图位置时, 需要对应更新放大区域的位置
         */
        refreshRegion: function() {
            this._getAlignTo();
            this._renderUI();

            // 更新位置标志
            this._refresh = true;
        }
        
    });

    return Zoomer;
}, {
    requires:["node"]
});