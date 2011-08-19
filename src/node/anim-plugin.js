/**
 * @module  anim-node-plugin
 * @author  lifesinger@gmail.com,
 *          qiaohua@taobao.com,
 *          yiminghe@gmail.com
 */
KISSY.add('node/anim-plugin', function(S, DOM, Anim, N, undefined) {

    var NLP = N.prototype,
        ANIM_KEY = "ksAnims" + S.now(),
        DISPLAY = 'display',
        NONE = 'none',
        OVERFLOW = 'overflow',
        HIDDEN = 'hidden',
        OPCACITY = 'opacity',
        HEIGHT = 'height',
        SHOW = "show",
        HIDE = "hide",
        FADE = "fade",
        SLIDE = "slide",
        TOGGLE = "toggle",
        WIDTH = 'width',
        FX = {
            show: [OVERFLOW, OPCACITY, HEIGHT, WIDTH],
            fade: [OPCACITY],
            slide: [OVERFLOW, HEIGHT]
        };

    N.__ANIM_KEY = ANIM_KEY;

    (function(P) {

        function attachAnim(elem, anim) {
            var anims = DOM.data(elem, ANIM_KEY);
            if (!anims) {
                DOM.data(elem, ANIM_KEY, anims = []);
            }
            anim.on("complete", function() {
                var anims = DOM.data(elem, ANIM_KEY);
                if (anims) {
                    // 结束后从关联的动画队列中删除当前动画
                    var index = S.indexOf(anim, anims);
                    if (index >= 0) {
                        anims.splice(index, 1);
                    }
                    if (!anims.length) {
                        DOM.removeData(elem, ANIM_KEY);
                    }
                }
            });
            // 当前节点的所有动画队列
            anims.push(anim);
        }

        P.animate = function() {
            var self = this,
                args = S.makeArray(arguments);
            S.each(self, function(elem) {
                var anim = Anim.apply(undefined, [elem].concat(args)).run();
                attachAnim(elem, anim);
            });
            return self;
        };

        P.stop = function(finish) {
            var self = this;
            S.each(self, function(elem) {
                var anims = DOM.data(elem, ANIM_KEY);
                if (anims) {
                    S.each(anims, function(anim) {
                        anim.stop(finish);
                    });
                    DOM.removeData(elem, ANIM_KEY);
                }
            });
            return self;
        };

        S.each({
                show: [SHOW, 1],
                hide: [SHOW, 0],
                fadeIn: [FADE, 1],
                fadeOut: [FADE, 0],
                slideDown: [SLIDE, 1],
                slideUp: [SLIDE, 0]
            },
            function(v, k) {
                P[k] = function(speed, callback, easing, nativeSupport) {
                    var self = this;
                    // 没有参数时，调用 DOM 中的对应方法
                    if (DOM[k] && !speed) {
                        DOM[k](self);
                    } else {
                        S.each(self, function(elem) {
                            var anim = fx(elem, v[0], speed, callback,
                                v[1], easing || 'easeOut', nativeSupport);
                            attachAnim(elem, anim);
                        });
                    }
                    return self;
                };
            });

        // toggle 提出来单独写，清晰点
        P[TOGGLE] = function(speed) {
            var self = this;
            P[self.css(DISPLAY) === NONE ? SHOW : HIDE].apply(self, arguments);
        };
    })(NLP);

    function fx(elem, which, speed, callback, visible, easing, nativeSupport) {

        if (visible) {
            DOM.show(elem);
        }

        // 根据不同类型设置初始 css 属性, 并设置动画参数
        var originalStyle = {}, style = {};
        S.each(FX[which], function(prop) {
            /**
             * 2011-08-19
             * originalStyle 记录行内样式，防止外联样式干扰！
             */
            var elemStyle = elem.style;
            if (prop === OVERFLOW) {
                originalStyle[OVERFLOW] = elemStyle[OVERFLOW];
                DOM.css(elem, OVERFLOW, HIDDEN);
            }
            else if (prop === OPCACITY) {
                // 取行内 opacity
                originalStyle[OPCACITY] = DOM.style(elem, OPCACITY);
                style.opacity = visible ? 1 : 0;
                if (visible) {
                    DOM.css(elem, OPCACITY, 0);
                }
            }
            else if (prop === HEIGHT) {
                originalStyle[HEIGHT] = elemStyle[HEIGHT];
                //http://arunprasad.wordpress.com/2008/08/26/naturalwidth-and-naturalheight-for-image-element-in-internet-explorer/
                style.height = (visible ?
                    DOM.css(elem, HEIGHT) || elem.naturalHeight :
                    0);
                if (visible) {
                    DOM.css(elem, HEIGHT, 0);
                }
            }
            else if (prop === WIDTH) {
                originalStyle[WIDTH] = elemStyle[WIDTH];
                style.width = (visible ?
                    DOM.css(elem, WIDTH) || elem.naturalWidth :
                    0);
                if (visible) {
                    DOM.css(elem, WIDTH, 0);
                }
            }
        });

        // 开始动画
        return new Anim(elem, style, speed, easing, function() {
            // 如果是隐藏，需要设置 diaplay
            if (!visible) {
                DOM.hide(elem);
            }

            // 还原样式
            if (originalStyle[HEIGHT] !== undefined) {
                DOM.css(elem, "height", originalStyle[HEIGHT]);
            }
            if (originalStyle[WIDTH] !== undefined) {
                DOM.css(elem, "width", originalStyle[WIDTH]);
            }
            if (originalStyle[OPCACITY] !== undefined) {
                DOM.css(elem, "opacity", originalStyle[OPCACITY]);
            }
            if (originalStyle[OVERFLOW] !== undefined) {
                DOM.css(elem, "overflow", originalStyle[OVERFLOW]);
            }

            if (callback) {
                callback();
            }

        }, nativeSupport).run();
    }

}, {
    requires:["dom","anim","./base"]
});
/**
 * 2011-05-17
 *  - 承玉：添加 stop ，随时停止动画
 *
 *  TODO
 *  - anim needs queue mechanism ?
 */
