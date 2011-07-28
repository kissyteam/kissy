/**
 * @module  anim-node-plugin
 * @author  lifesinger@gmail.com, qiaohua@taobao.com
 */
KISSY.add('node/anim-plugin', function(S, DOM, Anim, N, undefined) {

    var NLP = N.prototype,
        ANIM_KEY = "ksAnims" + S.now(),
        DISPLAY = 'display',
        NONE = 'none',
        OVERFLOW = 'overflow',
        HIDDEN = 'hidden',
        OPCACITY = 'opacity',
        HEIGHT = 'height', WIDTH = 'width',
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
                show: ['show', 1],
                hide: ['show', 0],
                toggle: ['toggle'],
                fadeIn: ['fade', 1],
                fadeOut: ['fade', 0],
                slideDown: ['slide', 1],
                slideUp: ['slide', 0]
            },
            function(v, k) {

                P[k] = function(speed, callback, easing, nativeSupport) {
                    var self = this;

                    // 没有参数时，调用 DOM 中的对应方法
                    if (DOM[k] && arguments.length === 0) {
                        DOM[k](self);
                    }
                    else {
                        // 原生支持问题很多，默认不采用原生
                        if (nativeSupport === undefined) {
                            nativeSupport = false;
                        }
                        S.each(this, function(elem) {
                            var anim = fx(elem, v[0], speed, callback,
                                v[1], easing, nativeSupport);
                            attachAnim(elem, anim);
                        });
                    }
                    return self;
                };
            });
    })(NLP);

    function fx(elem, which, speed, callback, visible, easing, nativeSupport) {
        if (which === 'toggle') {
            visible = DOM.css(elem, DISPLAY) === NONE ? 1 : 0;
            which = 'show';
        }

        if (visible) {
            DOM.css(elem, DISPLAY, DOM.data(elem, DISPLAY) || '');
        }

        // 根据不同类型设置初始 css 属性, 并设置动画参数
        var originalStyle = {}, style = {};
        S.each(FX[which], function(prop) {
            if (prop === OVERFLOW) {
                originalStyle[OVERFLOW] = DOM.css(elem, OVERFLOW);
                DOM.css(elem, OVERFLOW, HIDDEN);
            }
            else if (prop === OPCACITY) {
                originalStyle[OPCACITY] = DOM.css(elem, OPCACITY);
                style.opacity = visible ? 1 : 0;
                if (visible) {
                    DOM.css(elem, OPCACITY, 0);
                }
            }
            else if (prop === HEIGHT) {
                originalStyle[HEIGHT] = DOM.css(elem, HEIGHT);
                //http://arunprasad.wordpress.com/2008/08/26/naturalwidth-and-naturalheight-for-image-element-in-internet-explorer/
                style.height = (visible ? DOM.css(elem, HEIGHT) || elem.naturalHeight : 0);

                if (visible) {
                    DOM.css(elem, HEIGHT, 0);
                }
            }
            else if (prop === WIDTH) {
                originalStyle[WIDTH] = DOM.css(elem, WIDTH);
                style.width = (visible ? DOM.css(elem, WIDTH) || elem.naturalWidth : 0);
                if (visible) {
                    DOM.css(elem, WIDTH, 0);
                }
            }
        });

        // 开始动画
        return new Anim(elem, style, speed, easing || 'easeOut', function() {
            // 如果是隐藏, 需要还原一些 css 属性
            if (!visible) {
                // 保留原有值
                var currStyle = elem.style, oldVal = currStyle[DISPLAY];
                if (oldVal !== NONE) {
                    if (oldVal) {
                        DOM.data(elem, DISPLAY, oldVal);
                    }
                    currStyle[DISPLAY] = NONE;
                }

                // 还原样式
                if (originalStyle[HEIGHT]) {
                    DOM.css(elem, { height: originalStyle[HEIGHT] });
                }
                if (originalStyle[WIDTH]) {
                    DOM.css(elem, { width: originalStyle[WIDTH] });
                }
                if (originalStyle[OPCACITY]) {
                    DOM.css(elem, { opacity: originalStyle[OPCACITY] });
                }
                if (originalStyle[OVERFLOW]) {
                    DOM.css(elem, { overflow: originalStyle[OVERFLOW] });
                }

            }

            if (callback && S.isFunction(callback)) {
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
