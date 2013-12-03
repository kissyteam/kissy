/**
 * @ignore
 * transform hack for ie
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Dom = require('dom/base');
    var cssHooks = Dom._cssHooks;
    var rMatrix = /progid:DXImageTransform.Microsoft.Matrix\(([^)]*)\)/;

    cssHooks.transform = {
        get: function (elem, computed) {
            var elemStyle = elem[computed ? 'currentStyle' : 'style'],
                matrix;
            if (elemStyle && rMatrix.test(elemStyle.filter)) {
                matrix = RegExp.$1.split(',');
                var dx = 0 ,
                    dy = 0;
                var dxs = matrix[4] && matrix[4].split('=');
                var dys = matrix[5] && matrix[5].split('=');
                if (dxs && dxs[0].toLowerCase() === 'dx') {
                    dx = parseFloat(dxs[1]);
                }
                if (dys && dys[0].toLowerCase() === 'dy') {
                    dy = parseFloat(dys[1]);
                }
                matrix = [
                    matrix[0].split('=')[1],
                    matrix[2].split('=')[1],
                    matrix[1].split('=')[1],
                    matrix[3].split('=')[1],
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
                afterCenter,
                currentStyle = elem.currentStyle,
                matrixVal,
                region = {
                    width: elem.clientWidth,
                    height: elem.clientHeight
                },
                center = {
                    x: region.width / 2,
                    y: region.height / 2
                },
            // ie must be set inline
                origin = parseOrigin(elem.style.transformOrigin, region),
                filter;
            elemStyle.zoom = 1;
            if (value) {
                value = matrix(value);
                afterCenter = getCenterByOrigin(value, origin, center);
                afterCenter.x = afterCenter[0][0];
                afterCenter.y = afterCenter[1][0];
                matrixVal = [
                    'progid:DXImageTransform.Microsoft.Matrix(' +
                        'M11=' + value[0][0],
                    'M12=' + value[0][1],
                    'M21=' + value[1][0],
                    'M22=' + value[1][1],
                    // no effect in this filter set
                    // but used for get to keep status
                    // Dom.css(t,'transform',Dom.css(t,'transform'))
                    'Dx=' + value[0][2],
                    'Dy=' + value[1][2],
                    'SizingMethod="auto expand"'
                ].join(',') + ')';
            } else {
                matrixVal = '';
            }
            filter = currentStyle && currentStyle.filter || elemStyle.filter || '';

            if (!matrixVal && !S.trim(filter.replace(rMatrix, ''))) {
                // Setting style.filter to null, '' & ' ' still leave 'filter:' in the cssText
                // if 'filter:' is present at all, clearType is disabled, we want to avoid this
                // style.removeAttribute is IE Only, but so apparently is this code path...
                elemStyle.removeAttribute('filter');
                if (// unset inline opacity
                    !matrixVal ||
                        // if there is no filter style applied in a css rule, we are done
                        currentStyle && !currentStyle.filter) {
                    return;
                }
            }

            // otherwise, set new filter values
            // 如果不设，就不能覆盖外部样式表定义的样式，一定要设
            elemStyle.filter = rMatrix.test(filter) ?
                filter.replace(rMatrix, matrixVal) :
                filter + (filter ? ', ' : '') + matrixVal;

            if (matrixVal) {
                var realCenter = {
                    x: elem.offsetWidth / 2,
                    y: elem.offsetHeight / 2
                };
                elemStyle.marginLeft = afterCenter.x - realCenter.x + 'px';
                elemStyle.marginTop = afterCenter.y - realCenter.y + 'px';
            } else {
                elemStyle.marginLeft = elemStyle.marginTop = 0;
            }

        }
    };

    function getCenterByOrigin(m, origin, center) {
        var w = origin[0],
            h = origin[1];
        return multipleMatrix([
            [1, 0, w],
            [0, 1, h],
            [0, 0, 1]
        ], m, [
            [1, 0, -w],
            [0, 1, -h],
            [0, 0, 1]
        ], [
            [center.x],
            [center.y],
            [1]
        ]);
    }

    function parseOrigin(origin, region) {
        origin = origin || '50% 50%';
        origin = origin.split(/\s+/);
        if (origin.length === 1) {
            origin[1] = origin[0];
        }
        for (var i = 0; i < origin.length; i++) {
            var val = parseFloat(origin[i]);
            if (S.endsWith(origin[i], '%')) {
                origin[i] = val * region[i ? 'height' : 'width'] / 100;
            } else {
                origin[i] = val;
            }
        }
        return origin;
    }

    // turn transform string into standard matrix form
    function matrix(transform) {
        transform = transform.split(')');
        var trim = S.trim,
            i = -1,
            l = transform.length - 1,
            split, prop, val,
            ret = cssMatrixToComputableMatrix([1, 0, 0, 1, 0, 0]),
            curr;

        // Loop through the transform properties, parse and multiply them
        while (++i < l) {
            split = transform[i].split('(');
            prop = trim(split[0]);
            val = split[1];
            curr = [1, 0, 0, 1, 0, 0];
            switch (prop) {
                case 'translateX':
                    curr[4] = parseInt(val, 10);
                    break;

                case 'translateY':
                    curr[5] = parseInt(val, 10);
                    break;

                case 'translate':
                    val = val.split(',');
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
                    val = val.split(',');
                    curr[0] = +val[0];
                    curr[3] = val.length > 1 ? +val[1] : +val[0];
                    break;

                case 'skewX':
                    curr[2] = Math.tan(toRadian(val));
                    break;

                case 'skewY':
                    curr[1] = Math.tan(toRadian(val));
                    break;

                case 'skew':
                    val = val.split(',');
                    curr[2] = Math.tan(toRadian(val[0]));
                    if (val.length > 1) {
                        curr[1] = Math.tan(toRadian(val[1]));
                    }
                    break;

                case 'matrix':
                    val = val.split(',');
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
        var i;
        if (arguments.length > 2) {
            var ret = m1;
            for (i = 1; i < arguments.length; i++) {
                ret = multipleMatrix(ret, arguments[i]);
            }
            return ret;
        }

        var m = [],
            r1 = m1.length,
            r2 = m2.length,
            c2 = m2[0].length;

        for (i = 0; i < r1; i++) {
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
        return value.indexOf('deg') > -1 ?
            parseInt(value, 10) * (Math.PI * 2 / 360) :
            parseFloat(value);
    }
});

/**
 * @ignore
 * refer:
 * - https://github.com/louisremi/jquery.transform.js
 * - http://hg.mozilla.org/mozilla-central/file/7cb3e9795d04/layout/style/nsStyleAnimation.cpp#l971
 */