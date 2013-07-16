/**
 * transform hack for ie
 * @author yiminghe@gmail.com
 */
KISSY.add('dom/ie/transform', function (S, Dom) {
    var cssHooks = Dom._cssHooks;
    var rMatrix = /Matrix([^)]*)/;

    cssHooks.transform = {
        get: function (elem, computed) {
            var elemStyle = elem[computed ? 'currentStyle' : 'style'],
                matrix;
            if (elemStyle && rMatrix.test(elemStyle.filter)) {
                matrix = RegExp.$1.split(",");
                var dx = matrix[4] && matrix[4].split("=")[1] || 0;
                var dy = matrix[5] && matrix[5].split("=")[1] || 0;
                dx = parseFloat(dx);
                dy = parseFloat(dy);
                // 逆矩阵求解效率低，暂时从上一次 set 中取
                if (Dom.hasData(elem, 'ks-transform-dx-diff')) {
                    dx += Dom.data(elem, 'ks-transform-dx-diff');
                    dy += Dom.data(elem, 'ks-transform-dy-diff');
                }
                matrix = [
                    matrix[0].split("=")[1],
                    matrix[2].split("=")[1],
                    matrix[1].split("=")[1],
                    matrix[3].split("=")[1],
                    dx,
                    dy
                ];
            } else {
                return computed ? 'none' : '';
            }
            return 'matrix(' + matrix.join(',') + ')';
        },

        set: function (elem, value) {
            var elemStyle = elem.style,
                currentStyle = elem.currentStyle,
                matrixVal,
            // ie must be set inline
                origin = parseOrigin(elem.style['transformOrigin'], elem),
                filter;
            elemStyle.zoom = 1;
            value = matrix(value);
            var dx = value[0][2];
            var dy = value[1][2];
            if (origin) {
                value = adjustMatrixByOrigin(value, origin);
            }
            // 用于 get 时恢复
            Dom.data(elem, 'ks-transform-dx-diff', dx - value[0][2]);
            Dom.data(elem, 'ks-transform-dy-diff', dy - value[1][2]);
            matrixVal = [
                "Matrix(" +
                    "M11=" + value[0][0],
                "M12=" + value[0][1],
                "M21=" + value[1][0],
                "M22=" + value[1][1],
                "Dx=" + value[0][2],
                "Dy=" + value[1][2]
            ].join(',') + ')';
            filter = currentStyle && currentStyle.filter || elemStyle.filter || "";
            elemStyle.filter = rMatrix.test(filter) ?
                filter.replace(rMatrix, matrixVal) :
                filter + " progid:DXImageTransform.Microsoft." + matrixVal;
        }
    };

    function adjustMatrixByOrigin(m, origin) {
        var w = origin[0],
            h = origin[1];
        return multipleMatrix([
            [1, 0, w],
            [0, 1, h],
            [0, 0, 1]
        ], multipleMatrix(m, [
            [1, 0, -w],
            [0, 1, -h],
            [0, 0, 1]
        ]));
    }

    function parseOrigin(origin, el) {
        if (origin) {
            origin = origin.split(/\s+/);
            if (origin.length == 1) {
                origin[1] = origin[0];
            }
            for (var i = 0; i < origin.length; i++) {
                var val = parseFloat(origin[i]);
                if (S.endsWith(origin[i], '%')) {
                    origin[i] = val * el[i ? 'offsetHeight' : 'offsetWidth'] / 100;
                } else {
                    origin[i] = val;
                }
            }
            return origin;
        } else {
            return null;
        }
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

    // converts an angle string in any unit to a radian Float
    function toRadian(value) {
        return value.indexOf("deg") > -1 ?
            parseInt(value, 10) * (Math.PI * 2 / 360) :
            parseFloat(value);
    }
}, {
    requires: ['dom/base']
});

/**
 * @ignore
 * refer:
 * - https://github.com/louisremi/jquery.transform.js
 * - http://hg.mozilla.org/mozilla-central/file/7cb3e9795d04/layout/style/nsStyleAnimation.cpp#l971
 */