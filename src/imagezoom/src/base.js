/**
 * @fileOverview 图片放大效果 ImageZoom.
 */
KISSY.add('imagezoom/base', function (S, Node, Overlay, Zoomer, undefined) {
    var IMAGEZOOM_ICON_TMPL = "<span class='{iconClass}'></span>",
        IMAGEZOOM_WRAP_TMPL = "<span class='{wrapClass}'></span>";

    function show(obj) {
        obj && obj.show();
    }

    function hide(obj) {
        obj && obj.hide();
    }

    return Overlay.extend([
        Zoomer
    ], {

            initializer: function () {
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

            destructor: function () {
                var self = this;
                if (self.imageWrap) {
                    self.image.insertBefore(self.imageWrap, undefined);
                    self.imageWrap.remove();
                }
            },

            _render: function () {
                var self = this,
                    image = self.image;

                self.imageWrap = new Node(S.substitute(IMAGEZOOM_WRAP_TMPL, {
                    wrapClass: self.get('wrapClass')
                })).insertBefore(image, undefined);

                self.imageWrap.prepend(image);

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
            _bind: function () {
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
                            self.setInternal("align", undefined);
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

            _uiSetHasZoom: function (v) {
                if (v) {
                    show(this.icon);
                } else {
                    hide(this.icon);
                }
            },

            '_uiSetImageWidth': function (v) {
                this.image.width(v);
            },

            '_uiSetImageHeight': function (v) {
                this.image.height(v);
            }
        },
        {
            ATTRS: {
                imageNode: {
                    setter: function (el) {
                        return Node.one(el);
                    }
                },

                wrapClass: {
                    valueFn: function () {
                        return this.get('prefixCls') + 'imagezoom-wrap';
                    }
                },

                // width/height 默认和原小图大小保持一致
                // 小图和大图同比例情况下，len 为正方形
                width: {
                    valueFn: function () {
                        return this.get("imageWidth");
                    }
                },
                height: {
                    valueFn: function () {
                        return this.get("imageHeight");
                    }
                },

                imageWidth: {
                    valueFn: function () {
                        var img = this.get('imageNode');
                        img = img && img.width();
                        return img || 400;
                    }
                },
                imageHeight: {
                    valueFn: function () {
                        var img = this.get('imageNode');
                        img = img && img.height();
                        return img || 400;
                    }
                },
                imageLeft: {},
                imageTop: {},
                /**
                 * 显示放大区域标志
                 * @type {Boolean}
                 */
                hasZoom: {
                    value: true,
                    setter: function (v) {
                        return !!v;
                    }
                },

                /**
                 * 是否显示放大镜提示图标
                 * @type {Boolean}
                 */
                showIcon: {
                    value: true
                },
                iconClass: {
                    valueFn: function () {
                        return this.get('prefixCls') + 'imagezoom-icon';
                    }
                }
            }
        }, {
            xclass: 'imagezoom-viewer'
        });
}, {
    requires: ['node', 'overlay', './zoomer']
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

