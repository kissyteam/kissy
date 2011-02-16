/**
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

    return UIBase.create([require("box"),
        require("contentbox"),
        require("position"),
        require("loading"),
        UA['ie'] == 6 ? require("shim") : null,
        require("align"),
        require("mask"),
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

        renderUI:function() {
        },
        syncUI:function() {
        },
        bindUI: function() {
        },
        destructor: function() {
            var self = this;

            self.image.detach();
        },

        _render: function() {
            var self = this, wrap, image = self.image;

            wrap = self.imageWrap = new Node(S.substitute(IMAGEZOOM_WRAP_TMPL, {
                wrapClass: self.get('wrapClass')
            })).insertBefore(image);
            wrap.prepend(image);

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

                self.set('currentMouse', ev);

                timer = S.later(function() {
                    self.render();
                    self.show();

                    timer = undefined;
                }, 300);

            }).on('mouseleave', function(ev) {
                if (!self.get('hasZoom')) return;

                self.set('currentMouse', ev);

                if (timer) {
                    timer.cancel();
                    timer = undefined;
                } else {
                    self.hide();
                }
            }).on('mousemove', function(ev) {
                self.set('currentMouse', ev);
            });
        },

        _uiSetHasZoom: function(v) {
            if (v) {
                this.icon && this.icon.show();
            } else {
                this.icon && this.icon.hide();
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

