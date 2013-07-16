/**
 * @ignore
 * animation for transform property
 * @author yiminghe@gmail.com
 */
KISSY.add('anim/timer/transform', function (S, Dom, Fx) {
    function toMatrixArray(matrix) {
        matrix = matrix.substring('matrix('.length, matrix.length - 1).split(/,/);
        matrix = S.map(matrix, function (v) {
            return parseFloat(v);
        });
        return matrix;
    }

    function decomposeMatrix(matrix) {
        matrix = toMatrixArray(matrix);
        var scaleX, scaleY , skew ,
            A = matrix[0],
            B = matrix[1] ,
            C = matrix[2],
            D = matrix[3];

        // Make sure matrix is not singular
        if (A * D - B * C) {
            // step (3)
            scaleX = Math.sqrt(A * A + B * B);
            A /= scaleX;
            B /= scaleX;
            // step (4)
            skew = A * C + B * D;
            C -= A * skew;
            D -= B * skew;
            // step (5)
            scaleY = Math.sqrt(C * C + D * D);
            C /= scaleY;
            D /= scaleY;
            skew /= scaleY;
            // step (6)
            if (A * D < B * C) {
                A = -A;
                B = -B;
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
            'translateX': +matrix[4],
            'translateY': +matrix[5],
            'rotate': Math.atan2(B, A),
            'skewX': Math.atan(skew),
            'scaleX': scaleX,
            'scaleY': scaleY
        };
    }

    function defaultDecompose() {
        return {
            'translateX': 0,
            'translateY': 0,
            'rotate': 0,
            'skewX': 0,
            'scaleX': 1,
            'scaleY': 1
        };
    }

    function normalize(transform, el, origin) {
        var ret;
        //el.style.visibility='hidden';
        Dom.css(el, 'transform', transform);
        ret = Dom.css(el, 'transform');
        Dom.css(el, 'transform', origin);
        //el.style.visibility='';
        return ret;
    }

    function TransformFx() {
        TransformFx.superclass.constructor.apply(this, arguments);
    }

    S.extend(TransformFx, Fx, {
        load: function () {
            TransformFx.superclass.load.apply(this, arguments);
            var self = this,
                origin = self.from;
            if (self.from && self.from != 'none') {
                self.from = decomposeMatrix(self.from);
            } else {
                self.from = defaultDecompose();
            }
            if (self.to) {
                self.to = decomposeMatrix(normalize(self.to, self.anim.node, origin));
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
            ret.scaleX = interpolate(from.scaleX, to.scaleX, pos);
            ret.scaleY = interpolate(from.scaleY, to.scaleY, pos);
            return S.substitute('translate({translateX}px,{translateY}px) ' +
                'rotate({rotate}rad) ' +
                'skewX({skewX}rad) ' +
                'scale({scaleX},{scaleY})', ret);
        }
    });

    Fx.Factories.transform = TransformFx;

    return TransformFx;
}, {
    requires: ['dom', './fx']
});
/**
 * @ignore
 * refer:
 * - http://louisremi.github.io/jquery.transform.js/index.html
 * - http://hg.mozilla.org/mozilla-central/file/7cb3e9795d04/layout/style/nsStyleAnimation.cpp#l971
 */