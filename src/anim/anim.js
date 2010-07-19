/**
 * @module  anim
 * @author  lifesinger@gmail.com
 * @depends ks-core
 */
KISSY.add('anim', function(S, undefined) {

    var DOM = S.DOM, Easing = S.Easing,
        PARSE_FLOAT = parseFloat,
        parseEl = DOM.create('<div>'),
        PROPS = ('backgroundColor borderBottomColor borderBottomWidth borderLeftColor borderLeftWidth ' +
            'borderRightColor borderRightWidth borderSpacing borderTopColor borderTopWidth bottom color fontSize ' +
            'fontWeight height left letterSpacing lineHeight marginBottom marginLeft marginRight marginTop maxHeight ' +
            'maxWidth minHeight minWidth opacity outlineColor outlineOffset outlineWidth paddingBottom paddingLeft ' +
            'paddingRight paddingTop right textIndent top width wordSpacing zIndex').split(' '),

        defaultConfig = {
            duration: 1,
            easing: Easing.easeNone,
            queue: true
        };

    /**
     * Anim Class
     * @constructor
     */
    function Anim(elem, props, duration, easing, callback) {
        var self = this,
            isConfig = S.isPlainObject(duration),
            style = props, config;

        // ignore non-exist element
        if(!(elem = S.get(elem))) return;

        /**
         * the related dom element
         */
        self.domEl = elem;

        /**
         * the transition properties
         * 可以是："width: 200px; height: 500px" 字符串形式
         * 也可以是: { width: '200px', height: '500px' } 对象形式
         */
        if(S.isPlainObject(style)) {
            style = S.param(style, ';').replace(/=/g, ':');
        }
        self.props = normalize(style);

        /**
         * animation config
         */
        if(isConfig) {
            config = S.merge(defaultConfig, duration);
        } else {
            config = S.clone(defaultConfig);
            duration && (config.duration = PARSE_FLOAT(duration, 10) || 1);
            S.isString(easing) && (easing = Easing[easing]); // 可以是字符串, 比如 'easingOut'
            S.isFunction(easing) && (config.easing = easing);
            S.isFunction(callback) && (config.complete = callback);
        }
        self.config = config;

        var target = normalize(PROPS), comp = el.currentStyle ? el.currentStyle : getComputedStyle(el, null),
            prop, current = {}, start = S.now(), dur = opts.duration || 200, finish = start + dur, interval,
            easing = opts.easing || function(pos) {
                return (-Math.cos(pos * Math.PI) / 2) + 0.5;
            };

        for (prop in target) current[prop] = parse(comp[prop]);

        interval = setInterval(function() {
            var time = +new Date, pos = time > finish ? 1 : (time - start) / dur;
            for (prop in target)
                el.style[prop] = target[prop].f(current[prop].v, target[prop].v, easing(pos)) + target[prop].u;
            if (time > finish) {
                clearInterval(interval);
                opts.after && opts.after();
                after && setTimeout(after, 1);
            }
        }, 10);
    }

    S.augment(Anim, S.EventTarget, {

        _init: function() {

        }
    });

    S.Anim = Anim;

    function normalize(style) {
        var css, rules = { }, i = PROPS.length, v;
        parseEl.innerHTML = '<div style="' + style + '"></div>';
        css = parseEl.childNodes[0].style;
        while (i--) if (v = css[PROPS[i]]) rules[PROPS[i]] = parse(v);
        return rules;
    }

    function parse(prop) {
        var p = PARSE_FLOAT(prop), q = prop.replace(/^[\-\d\.]+/, '');
        return isNaN(p) ? { v: q, f: color, u: ''} : { v: p, f: interpolate, u: q };
    }

    function interpolate(source, target, pos) {
        return (source + (target - source) * pos).toFixed(3);
    }

    function s(str, p, c) {
        return str.substr(p, c || 1);
    }

    function color(source, target, pos) {
        var i = 2, j, c, tmp, v = [], r = [];
        while (j = 3,c = arguments[i - 1],i--)
            if (s(c, 0) == 'r') {
                c = c.match(/\d+/g);
                while (j--) v.push(~~c[j]);
            } else {
                if (c.length == 4) c = '#' + s(c, 1) + s(c, 1) + s(c, 2) + s(c, 2) + s(c, 3) + s(c, 3);
                while (j--) v.push(parseInt(s(c, 1 + j * 2, 2), 16));
            }
        while (j--) {
            tmp = ~~(v[j + 3] + (v[j] - v[j + 3]) * pos);
            r.push(tmp < 0 ? 0 : tmp > 255 ? 255 : tmp);
        }
        return 'rgb(' + r.join(',') + ')';
    }
});

/**
 * NOTES:
 *
 *  - api 借鉴了 YUI, jQuery 以及 http://www.w3.org/TR/css3-transitions/
 *  - 代码实现了借鉴了 Emile.js: http://github.com/madrobby/emile
 */
