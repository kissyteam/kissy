/**
 * @ignore
 * animation for transform property
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Dom = require('dom');
    var Fx = require('./fx');
    var translateTpl = S.Features.isTransform3dSupported() ?
        'translate3d({translateX}px,{translateY}px,0)' : 'translate({translateX}px,{translateY}px)';

    function toMatrixArray(matrix) {
        matrix = matrix.split(/,/);
        matrix = S.map(matrix, function (v) {
            return myParse(v);
        });
        return matrix;
    }

    // blog.yiminghe.me/2013/12/03/decomposing-css-2d-transform-matrix-into-simple-transformations
    function decomposeMatrix(matrix) {
        matrix = toMatrixArray(matrix);
        var scaleX, scaleY , skew ,
            A = matrix[0],
            B = matrix[1] ,
            C = matrix[2],
            D = matrix[3];

        // Make sure matrix is not singular
        if (A * D - B * C) {
            scaleX = Math.sqrt(A * A + B * B);
            skew = (A * C + B * D) / (A * D - C * B);
            scaleY = (A * D - B * C) / scaleX;
            // step (6)
            if (A * D < B * C) {
                skew = -skew;
                scaleX = -scaleX;
            }
            // matrix is singular and cannot be interpolated
        } else {
            // In this case the elem shouldn't be rendered, hence scale == 0
            scaleX = scaleY = skew = 0;
        }

        // The recomposition order is very important
        // see http://hg.mozilla.org/mozilla-central/file/7cb3e9795d04/layout/style/nsStyleAnimation.cpp#l971
        return {
            'translateX': myParse(matrix[4]),
            'translateY': myParse(matrix[5]),
            'rotate': myParse(Math.atan2(B, A) * 180 / Math.PI),
            'skewX': myParse(Math.atan(skew) * 180 / Math.PI),
            'skewY': 0,
            'scaleX': myParse(scaleX),
            'scaleY': myParse(scaleY)
        };
    }

    function defaultDecompose() {
        return {
            'translateX': 0,
            'translateY': 0,
            'rotate': 0,
            'skewX': 0,
            'skewY': 0,
            'scaleX': 1,
            'scaleY': 1
        };
    }

    function myParse(v) {
        return Math.round(parseFloat(v) * 1e5) / 1e5;
    }

    function getTransformInfo(transform) {
        transform = transform.split(')');
        var trim = S.trim,
            i = -1,
            l = transform.length - 1,
            split, prop, val,
            ret = defaultDecompose();

        // Loop through the transform properties, parse and multiply them
        while (++i < l) {
            split = transform[i].split('(');
            prop = trim(split[0]);
            val = split[1];
            switch (prop) {
                case 'translateX':
                case 'translateY':
                case 'scaleX':
                case 'scaleY':
                    ret[prop] = myParse(val);
                    break;

                case 'rotate':
                case 'skewX':
                case 'skewY':
                    var v = myParse(val);
                    if (!S.endsWith(val, 'deg')) {
                        v = v * 180 / Math.PI;
                    }
                    ret[prop] = v;
                    break;

                case 'translate':
                case 'translate3d':
                    val = val.split(',');
                    ret.translateX = myParse(val[0]);
                    ret.translateY = myParse(val[1] || 0);
                    break;

                case 'scale':
                    val = val.split(',');
                    ret.scaleX = myParse(val[0]);
                    ret.scaleY = myParse(val[1] || val[0]);
                    break;

                case 'matrix':
                    return decomposeMatrix(val);
            }
        }

        return ret;
    }

    function TransformFx() {
        TransformFx.superclass.constructor.apply(this, arguments);
    }

    S.extend(TransformFx, Fx, {
        load: function () {
            var self = this;
            TransformFx.superclass.load.apply(self, arguments);
            // user value has priority over computed value
            self.from = Dom.style(self.anim.node, 'transform') || self.from;
            if (self.from && self.from !== 'none') {
                self.from = getTransformInfo(self.from);
            } else {
                self.from = defaultDecompose();
            }
            if (self.to) {
                self.to = getTransformInfo(self.to);
            } else {
                self.to = defaultDecompose();
            }
        },

        interpolate: function (from, to, pos) {
            var interpolate = TransformFx.superclass.interpolate;
            var ret = {};
            ret.translateX = interpolate(from.translateX, to.translateX, pos);
            ret.translateY = interpolate(from.translateY, to.translateY, pos);
            ret.rotate = interpolate(from.rotate, to.rotate, pos);
            ret.skewX = interpolate(from.skewX, to.skewX, pos);
            ret.skewY = interpolate(from.skewY, to.skewY, pos);
            ret.scaleX = interpolate(from.scaleX, to.scaleX, pos);
            ret.scaleY = interpolate(from.scaleY, to.scaleY, pos);
            return S.substitute(translateTpl + ' ' +
                'rotate({rotate}deg) ' +
                'skewX({skewX}deg) ' +
                'skewY({skewY}deg) ' +
                'scale({scaleX},{scaleY})', ret);
        }
    });

    Fx.Factories.transform = TransformFx;

    return TransformFx;
});
/**
 * @ignore
 * refer:
 * - http://louisremi.github.io/jquery.transform.js/index.html
 * - http://hg.mozilla.org/mozilla-central/file/7cb3e9795d04/layout/style/nsStyleAnimation.cpp#l971
 */