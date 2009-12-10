/*
Copyright (c) 2009, Kissy UI Library. All rights reserved.
MIT Licensed.
http://kissy.googlecode.com/

Date: 2009-12-10 08:39:06
Revision: 292
*/
/**
 * @module anim
 */
KISSY.add("anim", null, undefined, {
    submodules: ["anim-base", "anim-easing"]
});
/**
 * @module anim
 * @submodule anim-base
 * Thanks to emile.js (c) 2009 Thomas Fuchs http://github.com/madrobby/emile
 */
KISSY.add("anim-base", function(S) {

    var parseEl = document.createElement("div"),
        props = ("backgroundColor borderBottomColor borderBottomWidth borderLeftColor borderLeftWidth " +
                 "borderRightColor borderRightWidth borderSpacing borderTopColor borderTopWidth bottom color fontSize " +
                 "fontWeight height left letterSpacing lineHeight marginBottom marginLeft marginRight marginTop maxHeight " +
                 "maxWidth minHeight minWidth opacity outlineColor outlineOffset outlineWidth paddingBottom paddingLeft " +
                 "paddingRight paddingTop right textIndent top width wordSpacing zIndex").split(" ");

    function parse(prop) {
        var p = parseFloat(prop), q = prop.replace(/^[\-\d\.]+/, "");
        return isNaN(p) ? { v: q, f: color, u: ""} : { v: p, f: lerp, u: q };
    }

    function normalize(style) {
        var css, rules = {}, i = props.length, v;
        parseEl.innerHTML = '<div style="' + style + '"></div>';
        css = parseEl.childNodes[0].style;
        while (i--) if (v = css[props[i]]) rules[props[i]] = parse(v);
        return rules;
    }

    function s(str, p, c) {
        return str.substr(p, c || 1);
    }

    function color(source, target, pos) {
        var i = 2, j, c, tmp, v = [], r = [];
        while (j = 3,c = arguments[i - 1],i--)
            if (s(c, 0) == "r") {
                c = c.match(/\d+/g);
                while (j--) v.push(~~c[j]);
            } else {
                if (c.length == 4) c = "#" + s(c, 1) + s(c, 1) + s(c, 2) + s(c, 2) + s(c, 3) + s(c, 3);
                while (j--) v.push(parseInt(s(c, 1 + j * 2, 2), 16));
            }
        while (j--) {
            tmp = ~~(v[j + 3] + (v[j] - v[j + 3]) * pos);
            r.push(tmp < 0 ? 0 : tmp > 255 ? 255 : tmp);
        }
        return "rgb(" + r.join(",") + ")";
    }

    function lerp(source, target, pos) {
        return (source + (target - source) * pos).toFixed(3);
    }

    S.Anim = function(el, style, opts) {
        el = typeof el == "string" ? document.getElementById(el) : el;
        opts = opts || {};

        var target = normalize(style), comp = el.currentStyle ? el.currentStyle : getComputedStyle(el, null),
            prop, current = {}, start = +new Date, dur = opts.duration || 200, finish = start + dur, interval,
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
            }
        }, 10);
    };
});
/**
 * @module anim
 * @submodule anim-easing
 */
KISSY.add("anim-easing", function(S) {

    // Based on Easing Equations (c) 2003 Robert Penner, all rights reserved.
    // This work is subject to the terms in http://www.robertpenner.com/easing_terms_of_use.html
    // Adapted for KISSY by BP.Wang <lifesinger@gmail.com>
    // Preview: http://www.robertpenner.com/easing/easing_demo.html

    /*!
     *  TERMS OF USE - EASING EQUATIONS
     *  Open source under the BSD License.
     *  Easing Equations (c) 2003 Robert Penner, all rights reserved.
     */
    S.Easing = {

        easeInQuad: function(pos) {
            return Math.pow(pos, 2);
        },

        easeOutQuad: function(pos) {
            return -(Math.pow((pos - 1), 2) - 1);
        },

        easeInOutQuad: function(pos) {
            if ((pos /= 0.5) < 1) return 0.5 * Math.pow(pos, 2);
            return -0.5 * ((pos -= 2) * pos - 2);
        },

        easeInCubic: function(pos) {
            return Math.pow(pos, 3);
        },

        easeOutCubic: function(pos) {
            return (Math.pow((pos - 1), 3) + 1);
        },

        easeInOutCubic: function(pos) {
            if ((pos /= 0.5) < 1) return 0.5 * Math.pow(pos, 3);
            return 0.5 * (Math.pow((pos - 2), 3) + 2);
        },

        easeInQuart: function(pos) {
            return Math.pow(pos, 4);
        },

        easeOutQuart: function(pos) {
            return -(Math.pow((pos - 1), 4) - 1);
        },

        easeInOutQuart: function(pos) {
            if ((pos /= 0.5) < 1) return 0.5 * Math.pow(pos, 4);
            return -0.5 * ((pos -= 2) * Math.pow(pos, 3) - 2);
        },

        easeInQuint: function(pos) {
            return Math.pow(pos, 5);
        },

        easeOutQuint: function(pos) {
            return (Math.pow((pos - 1), 5) + 1);
        },

        easeInOutQuint: function(pos) {
            if ((pos /= 0.5) < 1) return 0.5 * Math.pow(pos, 5);
            return 0.5 * (Math.pow((pos - 2), 5) + 2);
        },

        easeInSine: function(pos) {
            return -Math.cos(pos * (Math.PI / 2)) + 1;
        },

        easeOutSine: function(pos) {
            return Math.sin(pos * (Math.PI / 2));
        },

        easeInOutSine: function(pos) {
            return (-.5 * (Math.cos(Math.PI * pos) - 1));
        },

        easeInExpo: function(pos) {
            return (pos == 0) ? 0 : Math.pow(2, 10 * (pos - 1));
        },

        easeOutExpo: function(pos) {
            return (pos == 1) ? 1 : -Math.pow(2, -10 * pos) + 1;
        },

        easeInOutExpo: function(pos) {
            if (pos == 0) return 0;
            if (pos == 1) return 1;
            if ((pos /= 0.5) < 1) return 0.5 * Math.pow(2, 10 * (pos - 1));
            return 0.5 * (-Math.pow(2, -10 * --pos) + 2);
        },

        easeInCirc: function(pos) {
            return -(Math.sqrt(1 - (pos * pos)) - 1);
        },

        easeOutCirc: function(pos) {
            return Math.sqrt(1 - Math.pow((pos - 1), 2));
        },

        easeInOutCirc: function(pos) {
            if ((pos /= 0.5) < 1) return -0.5 * (Math.sqrt(1 - pos * pos) - 1);
            return 0.5 * (Math.sqrt(1 - (pos -= 2) * pos) + 1);
        },

        easeOutBounce: function(pos) {
            if ((pos) < (1 / 2.75)) {
                return (7.5625 * pos * pos);
            } else if (pos < (2 / 2.75)) {
                return (7.5625 * (pos -= (1.5 / 2.75)) * pos + .75);
            } else if (pos < (2.5 / 2.75)) {
                return (7.5625 * (pos -= (2.25 / 2.75)) * pos + .9375);
            } else {
                return (7.5625 * (pos -= (2.625 / 2.75)) * pos + .984375);
            }
        },

        easeInBack: function(pos) {
            var s = 1.70158;
            return (pos) * pos * ((s + 1) * pos - s);
        },

        easeOutBack: function(pos) {
            var s = 1.70158;
            return (pos = pos - 1) * pos * ((s + 1) * pos + s) + 1;
        },

        easeInOutBack: function(pos) {
            var s = 1.70158;
            if ((pos /= 0.5) < 1) return 0.5 * (pos * pos * (((s *= (1.525)) + 1) * pos - s));
            return 0.5 * ((pos -= 2) * pos * (((s *= (1.525)) + 1) * pos + s) + 2);
        },

        elastic: function(pos) {
            return -1 * Math.pow(4, -8 * pos) * Math.sin((pos * 6 - 1) * (2 * Math.PI) / 2) + 1;
        },

        swingFromTo: function(pos) {
            var s = 1.70158;
            return ((pos /= 0.5) < 1) ? 0.5 * (pos * pos * (((s *= (1.525)) + 1) * pos - s)) :
                   0.5 * ((pos -= 2) * pos * (((s *= (1.525)) + 1) * pos + s) + 2);
        },

        swingFrom: function(pos) {
            var s = 1.70158;
            return pos * pos * ((s + 1) * pos - s);
        },

        swingTo: function(pos) {
            var s = 1.70158;
            return (pos -= 1) * pos * ((s + 1) * pos + s) + 1;
        },

        bounce: function(pos) {
            if (pos < (1 / 2.75)) {
                return (7.5625 * pos * pos);
            } else if (pos < (2 / 2.75)) {
                return (7.5625 * (pos -= (1.5 / 2.75)) * pos + .75);
            } else if (pos < (2.5 / 2.75)) {
                return (7.5625 * (pos -= (2.25 / 2.75)) * pos + .9375);
            } else {
                return (7.5625 * (pos -= (2.625 / 2.75)) * pos + .984375);
            }
        },

        bouncePast: function(pos) {
            if (pos < (1 / 2.75)) {
                return (7.5625 * pos * pos);
            } else if (pos < (2 / 2.75)) {
                return 2 - (7.5625 * (pos -= (1.5 / 2.75)) * pos + .75);
            } else if (pos < (2.5 / 2.75)) {
                return 2 - (7.5625 * (pos -= (2.25 / 2.75)) * pos + .9375);
            } else {
                return 2 - (7.5625 * (pos -= (2.625 / 2.75)) * pos + .984375);
            }
        },

        easeFromTo: function(pos) {
            if ((pos /= 0.5) < 1) return 0.5 * Math.pow(pos, 4);
            return -0.5 * ((pos -= 2) * Math.pow(pos, 3) - 2);
        },

        easeFrom: function(pos) {
            return Math.pow(pos, 4);
        },

        easeTo: function(pos) {
            return Math.pow(pos, 0.25);
        }
    };
});
