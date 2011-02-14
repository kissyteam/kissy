/**
 * @fileoverview 图片放大效果 ImageZoom.
 * @author  玉伯<lifesinger@gmail.com>, 乔花<qiaohua@taobao.com>
 * @see silde.html
 */
KISSY.add('imagezoom/base', function(S, DOM, Event, UA, UIBase, Node, Zoomer, undefined) {
    var doc = document,
        IMAGEZOOM_ICON_TMPL = "<span class='{iconClass}'></span>",
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
            tmp && imgOnLoad(tmp, function() {
                alert('hi');
                self._render();
                self._bind();
                self._onAttrChanges();
            });
        },

        renderUI:function() {
        },
        syncUI:function() {
        },
        bindUI: function() {
        },
        destructor: function() {
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
            var self = this, timer;

            Event.on(self.image, 'mouseenter', function(ev) {
                if (!self.get('hasZoom')) return;

                self._setEv(ev);
                Event.on(doc.body, 'mousemove', self._setEv, self);

                timer = S.later(function() {
                    self.render();
                    self.set("visible", !self.get("visible"));
                }, 300);
            });

            Event.on(self.image, 'mouseleave', function() {
                if (!self.get('hasZoom')) return;

                Event.remove(doc.body, 'mousemove', self._setEv);

                self.set("visible", !self.get("visible"));

                if (timer) {
                    timer.cancel();
                    timer = undefined;
                }
            });
        },

        /**
         * attrs 改变事件
         * @private
         */
        _onAttrChanges: function() {
            var self = this;

            self.on('afterHasZoomChange', function(e) {
                e.newVal ? self.show() : self.hide();
            });
        },

        /**
         * 保存当前鼠标位置
         * @param {Object} ev
         * @private
         */
        _setEv: function(ev) {
            this._ev = ev;
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
                    img = img && img.clientWidth;
                    return img || 400;
                }
            },
            imageHeight: {
                valueFn: function() {
                    var img = this.get('imageNode');
                    img = img && img.clientHeight;
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

    function imgOnLoad(img, callback) {
        if (checkImageReady(img)) {
            callback();
        }
        // 1) 图尚未加载完毕，等待 onload 时再初始化 2) 多图切换时需要绑定load事件来更新相关信息
        Event.on(img, 'load', callback);
    }

    function checkImageReady(imgElem) {
        return (imgElem && imgElem.complete && imgElem.clientWidth) ? true : false;
    }
}, {
    requires: ['dom','event', 'ua', 'uibase', 'node', 'imagezoom/zoomer']
});


/**
 * NOTES:
 *  201101
 *      - 重构代码, 基于 UIBase
 *
 */

