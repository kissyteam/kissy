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
            hide: ['show', 0],
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

    function fx(elem, which, speed, callback, visible) {
        if (which === 'toggle') {
            visible = DOM.css(elem, DISPLAY) === NONE ? 1 : 0;
            which = 'show';
        }

        if (visible) DOM.css(elem, DISPLAY, DOM.data(elem, DISPLAY) || '');

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
                if (visible) DOM.css(elem, OPCACITY, 0);
            }
            else if (prop === HEIGHT) {
                originalStyle[HEIGHT] = DOM.css(elem, HEIGHT);
                style.height = (visible ? DOM.css(elem, HEIGHT) || elem.naturalHeight : 0);
                if (visible) DOM.css(elem, HEIGHT, 0);
            }
            else if (prop === WIDTH) {
                originalStyle[WIDTH] = DOM.css(elem, WIDTH);
                style.width = (visible ? DOM.css(elem, WIDTH) || elem.naturalWidth : 0);
                if (visible) DOM.css(elem, WIDTH, 0);
            }
        });

        // 开始动画
        new S.Anim(elem, style, speed, 'easeOut', function() {
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
                if(originalStyle[HEIGHT]) DOM.css(elem, { height: originalStyle[HEIGHT] });
                if(originalStyle[WIDTH]) DOM.css(elem, { height: originalStyle[WIDTH] });
                if(originalStyle[OPCACITY]) DOM.css(elem, { height: originalStyle[OPCACITY] });
                if(originalStyle[OVERFLOW]) DOM.css(elem, { height: originalStyle[OVERFLOW] });
            }

            if (callback && S.isFunction(callback)) callback();

        }).run();
    }

});
