/**
 * test transform cross-browser implementation
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, Dom) {
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
        if (arguments.length > 2) {
            var ret = m1;
            for (var i = 1; i < arguments.length; i++) {
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
        return value.indexOf("deg") > -1 ?
            parseInt(value, 10) * (Math.PI * 2 / 360) :
            parseFloat(value);
    }

    function toBeAlmostEqual(actual, expected) {
        return Math.abs(actual - expected) < 1e-4;
    }

    describe('style-transform', function () {
        var div;

        beforeEach(function () {
            this.addMatchers({
                toBeAlmostEqual: function (expected) {
                    return toBeAlmostEqual(this.actual, expected);
                },
                toBeAlmostEqualMatrix: function (expected) {
                    var m1=this.actual;
                    for(var i=0;i<m1.length;i++){
                        var row=m1[i];
                        for(var j=0;j<row.length;j++){
                            if(!toBeAlmostEqual(m1[i][j],expected[i][j])){
                                return false;
                            }
                        }
                    }
                    return true;
                }
            });
            div = Dom.create('<div style="position: absolute;' +
                'width: 100px;height: 100px;"></div>');
            document.body.appendChild(div);
        });

        afterEach(function () {
            Dom.remove(div);
        });

        function compare(val){
            expect(Dom.css(div,'transform')).toBe('none');
            var expectedMatrix = matrix(val);
            Dom.css(div, 'transform', val);
            var myMatrix = Dom.css(div, 'transform');
            myMatrix = matrix(myMatrix);
            expect(myMatrix).toBeAlmostEqualMatrix(expectedMatrix);
        }

        it('works for rotate', function () {
            var val='rotate(30deg)';
            compare(val);
        });

        it('works for origin', function () {
            var val='rotate(30deg)';
            Dom.css(div,'transform-origin','0 0');
            compare(val);
        });

        it('works for complex condition', function () {
            var val='translate(49px) rotate(30deg) skewX(30deg)';
            Dom.css(div,'transform-origin','0 0');
            compare(val);
        });
    });
}, {
    requires: ['dom']
});