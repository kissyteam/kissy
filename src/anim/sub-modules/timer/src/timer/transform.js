/**
 * @ignore
 * animation for transform property
 * @author yiminghe@gmail.com
 */
KISSY.add('anim/timer/transform', function (S, Dom, Fx) {
    function decomposeMatrix(matrix) {
        var scaleX, scaleY , skew ,
            A = matrix[0][0],
            B = matrix[1][0] ,
            C = matrix[0][1],
            D = matrix[1][1];

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
            'translateX': myParse(matrix[0][2]),
            'translateY': myParse(matrix[1][2]),
            'rotate': myParse(Math.atan2(B, A) ),
            'skewX': myParse(Math.atan(skew)),
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
            'scaleX': 1,
            'scaleY': 1
        };
    }

    // converts an angle string in any unit to a radian Float
    function toRadian(value) {
        return value.indexOf("deg") > -1 ?
            myParse(parseInt(value, 10) * (Math.PI * 2 / 360)) :
            myParse(value);
    }

    function myParse(v) {
        return Math.round(parseFloat(v) * 1e5) / 1e5;
    }

    // turn transform string into standard matrix form
    function matrix(transform) {
        transform = transform.split(")");
        var trim = S.trim,
            i = -1,
            l = transform.length - 1,
            split, prop, val,
            ret = cssMatrixToComputableMatrix([1, 0, 0, 1, 0, 0]),
            curr;

        // Loop through the transform properties, parse and multiply them
        while (++i < l) {
            split = transform[i].split("(");
            prop = trim(split[0]);
            val = split[1];
            curr = [1, 0, 0, 1, 0, 0];
            switch (prop) {
                case "translateX":
                    curr[4] = parseInt(val, 10);
                    break;

                case "translateY":
                    curr[5] = parseInt(val, 10);
                    break;

                case 'translate':
                    val = val.split(",");
                    curr[4] = parseInt(val[0], 10);
                    curr[5] = parseInt(val[1] || 0, 10);
                    break;

                case 'rotate':
                    val = toRadian(val);
                    curr[0] = Math.cos(val);
                    curr[1] = Math.sin(val);
                    curr[2] = -Math.sin(val);
                    curr[3] = Math.cos(val);
                    break;

                case 'scaleX':
                    curr[0] = +val;
                    break;

                case 'scaleY':
                    curr[3] = +val;
                    break;

                case 'scale':
                    val = val.split(",");
                    curr[0] = +val[0];
                    curr[3] = val.length > 1 ? +val[1] : +val[0];
                    break;

                case "skewX":
                    curr[2] = Math.tan(toRadian(val));
                    break;

                case "skewY":
                    curr[1] = Math.tan(toRadian(val));
                    break;

                case 'matrix':
                    val = val.split(",");
                    curr[0] = +val[0];
                    curr[1] = +val[1];
                    curr[2] = +val[2];
                    curr[3] = +val[3];
                    curr[4] = parseInt(val[4], 10);
                    curr[5] = parseInt(val[5], 10);
                    break;
            }
            ret = multipleMatrix(ret, cssMatrixToComputableMatrix(curr));
        }

        return ret;
    }

    function cssMatrixToComputableMatrix(matrix) {
        return[
            [matrix[0], matrix[2], matrix[4]],
            [matrix[1], matrix[3], matrix[5]],
            [0, 0, 1]
        ];
    }

    function setMatrix(m, x, y, v) {
        if (!m[x]) {
            m[x] = [];
        }
        m[x][y] = v;
    }

    function multipleMatrix(m1, m2) {
        var m = [],
            r1 = m1.length,
            r2 = m2.length,
            c2 = m2[0].length;

        for (var i = 0; i < r1; i++) {
            for (var k = 0; k < c2; k++) {
                var sum = 0;
                for (var j = 0; j < r2; j++) {
                    sum += m1[i][j] * m2[j][k];
                }
                setMatrix(m, i, k, sum);
            }
        }

        return m;
    }

    function TransformFx() {
        TransformFx.superclass.constructor.apply(this, arguments);
    }

    S.extend(TransformFx, Fx, {
        load: function () {
            var self = this;
            TransformFx.superclass.load.apply(self, arguments);
            if (self.from && self.from != 'none') {
                self.from = decomposeMatrix(matrix(self.from));
            } else {
                self.from = defaultDecompose();
            }
            if (self.to) {
                self.to = decomposeMatrix(matrix(self.to));
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