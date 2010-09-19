/**
 * @module  anim-node-plugin
 * @author  lifesinger@gmail.com, qiaohua@taobao.com
 */
KISSY.add('anim-node-plugin', function(S, undefined) {

    var DOM = S.DOM, Anim = S.Anim,
        NP = S.Node.prototype, NLP = S.NodeList.prototype,

        DISPLAY = 'display', NONE = 'none',
        OVERFLOW = 'overflow', HIDDEN = 'hidden',
        OPCACITY = 'opacity',
        HEIGHT = 'height', WIDTH = 'width', AUTO = 'auto',

        FX = {
            show: [OVERFLOW, OPCACITY, HEIGHT, WIDTH],
            fade: [OPCACITY],
            slide: [OVERFLOW, HEIGHT]
        };

    S.each([NP, NLP], function(P) {
        P.animate = function() {
            var args = S.makeArray(arguments);

            S.each(this, function(elem) {
                Anim.apply(undefined, [elem].concat(args)).run();
            });
            return this;
        };

        S.each({
            show: ['show', 1],
            hide: ['hide', 0],
            toggle: ['toggle'],
            fadeIn: ['fade', 1],
            fadeOut: ['fade', 0],
            slideDown: ['slide', 1],
            slideUp: ['slide', 0]
        },
            function(v, k) {

                P[k] = function(speed, callback) {
                    // 没有参数时，调用 DOM 中的对应方法
                    if (DOM[k] && arguments.length === 0) {
                        DOM[k](this);
                    }
                    else {
                        S.each(this, function(elem) {
                            fx(elem, v[0], speed, callback, v[1]);
                        });
                    }
                    return this;
                };
            });
    });

    function fx(elem, which, speed, callback, display) {
        if (which === 'toggle') {
            display = DOM.css(elem, DISPLAY) === NONE ? 1 : 0;
            which = display ? 'show' : 'hide';
        }

        if (display) DOM.css(elem, DISPLAY, DOM.data(elem, DISPLAY) || '');

        // 根据不同类型设置初始 css 属性, 并设置动画参数
        var style = { };
        S.each(FX[which], function(prop) {
            if (prop === OVERFLOW) {
                DOM.css(elem, OVERFLOW, HIDDEN);
            }
            else if (prop === OPCACITY) {
                style.opacity = display ? 1 : 0;
                if (display) DOM.css(elem, OPCACITY, 0);
            }
            else if (prop === HEIGHT) {
                style.height = (display ? DOM.css(elem, HEIGHT) || elem.naturalHeight : 0);
                if (display) DOM.css(elem, HEIGHT, 0);
            }
            else if (prop === WIDTH) {
                style.width = (display ? DOM.css(elem, WIDTH) || elem.naturalWidth : 0);
                if (display) DOM.css(elem, WIDTH, 0);
            }
        });

        // 开始动画
        new S.Anim(elem, style, speed, 'easeOut', function() {
            // 如果是隐藏, 需要还原一些 css 属性
            if (!display) {
                // 保留原有值
                var style = elem.style, oldVal = style[DISPLAY];
                if (oldVal !== NONE) {
                    if (oldVal) {
                        DOM.data(elem, DISPLAY, oldVal);
                    }
                    style[DISPLAY] = NONE;
                }

                // 还原部分样式
                DOM.css(elem, {
                    height: AUTO,
                    width: AUTO,
                    overflow: AUTO,
                    opacity: 1
                });
            }
            if (callback && S.isFunction(callback)) callback();
        }).run();
    }

});
