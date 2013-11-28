/**
 * test case for simple anim
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, Dom, Anim, Node) {
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

                case 'matrix3d':
                    val = val.split(",");
                    curr[0] = +val[0];
                    curr[1] = +val[1];
                    curr[2] = +val[4];
                    curr[3] = +val[5];
                    curr[4] = parseInt(val[8], 10);
                    curr[5] = parseInt(val[9], 10);
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

    function toBeAlmostEqualMatrixItem(actual, expected) {
        return Math.abs(actual - expected) < 1e-4;
    }

    return {
        run: function () {
            var $ = Node.all;

            describe("anim-simple", function () {
                beforeEach(function () {
                    this.addMatchers({
                        toBeAlmostEqual: function (expected) {
                            return Math.abs(parseInt(this.actual) - parseInt(expected)) < 20;
                        },

                        toBeAlmostEqualMatrix: function (expected) {
                            var m1 = this.actual;
                            for (var i = 0; i < m1.length; i++) {
                                var row = m1[i];
                                for (var j = 0; j < row.length; j++) {
                                    if (!toBeAlmostEqualMatrixItem(m1[i][j], expected[i][j])) {
                                        return false;
                                    }
                                }
                            }
                            return true;
                        },

                        toBeEqual: function (expected) {
                            return Math.abs(parseInt(this.actual) - parseInt(expected)) < 5;
                        }
                    });
                });

                function padding(s) {
                    if (s.length == 1)
                        return "0" + s;
                    return s;
                }

                function normalizeColor(c) {
                    if (c.toLowerCase().lastIndexOf("rgb(") == 0) {
                        var x = [];
                        c.replace(/\d+/g, function (m) {
                            x.push(padding(Number(m).toString(16)));
                        });
                        c = "#" + x.join("");
                    } else if (c.length == 4) {
                        c = c.replace(/[^#]/g, function (c) {
                            return c + c;
                        });
                    }
                    return c;
                }

                it("should start and end anim properly", function () {
                    var test1 = Dom.create('<div style="position: absolute;' +
                        ' text-align: center;' +
                        'overflow: hidden">^o^</div>');
                    Dom.append(test1, 'body');
                    Dom.css(test1, {
                        //'border-color':"#000",
                        width: "10px",
                        height: "20px",
                        left: "120px",
                        top: "20px",
                        color: "#000"
                    });
                    var initColor = normalizeColor(Dom.css(test1, "border-color"));

                    var anim = new Anim(test1, {
                            'background-color': '#fcc',
                            //'border': '5px dashed #999',
                            'border-width': '5px',
                            'border-color': "#999999",
                            'border-style': "dashed",
                            'width': '100px',
                            'height': '50px',
                            'left': '900px',
                            'top': '285px',
                            'opacity': '.5',
                            'font-size': '48px',
                            'padding': '30px 0',
                            'color': '#FF3333'
                        },
                        0.5
                    );

                    anim.run();

                    waits(100);

                    runs(function () {
                        expect(normalizeColor(Dom.css(test1, "borderTopColor")))
                            .not.toBe(initColor);
                        expect(Dom.css(test1, 'width')).not.toBe("10px");
                        expect(Dom.css(test1, 'height')).not.toBe("20px");
                        expect(Dom.css(test1, 'left')).not.toBe("120px");
                        expect(Dom.css(test1, "top")).not.toBe("20px");
                    });

                    waits(800);
                    runs(function () {
                        expect(normalizeColor(Dom.style(test1, "border-color")))
                            .toBe("#999999");
                        expect(parseInt(Dom.css(test1, 'width'))).toBeEqual(100);
                        expect(parseInt(Dom.css(test1, 'height'))).toBeEqual(50);
                        expect(Dom.css(test1, 'left')).toBe("900px");
                        expect(Dom.css(test1, "top")).toBe("285px");
                        Dom.remove(test1);
                    });

                });

                it('support different easing for different property', function () {
                    if (S.config('anim/useTransition')) {
                        // native does not support easing as function
                        return;
                    }
                    var div = $('<div style="position:absolute;left:0;top:0;"></div>')
                        .prependTo('body');
                    div.animate({
                        left: {
                            value: "100px",
                            easing: function () {
                                return 0.5;
                            }
                        },
                        top: {
                            value: "100px",
                            easing: function () {
                                return 0.2;
                            }
                        }
                    }, {
                        duration: 0.3
                    });

                    waits(100);

                    runs(function () {
                        expect(parseInt(div.css('top'))).toBe(20);
                        expect(parseInt(div.css('left'))).toBe(50);
                    });

                    waits(600);

                    runs(function () {
                        expect(parseInt(div.css('top'))).toBe(100);
                        expect(parseInt(div.css('left'))).toBe(100);
                        div.remove();
                    });
                });

                it("works for width/height", function () {
                    var div = $("<div style='border:1px solid red;'>" +
                        "<div style='width:100px;height: 100px;'>" +
                        "</div>" +
                        "</div>").appendTo('body');

                    // width height 特殊，
                    // ie6 需要设置 overflow:hidden
                    // 否则动画不对
                    div.css({
                        height: 0,
                        width: 0,
                        overflow: 'hidden'
                    }).animate({
                            height: 100,
                            width: 100
                        }, {
                            duration: 0.2,
                            complete: function () {
                                div.remove();
                            }
                        });

                    expect(div.height()).toBe(0);
                    expect(div.width()).toBe(0);

                    waits(100);

                    runs(function () {
                        // overflow hidden ie6 没设好
                        // https://github.com/kissyteam/kissy/issues/146
                        expect(div.height()).not.toBe(100);
                        expect(div.width()).not.toBe(100);
                        expect(div.height()).not.toBe(0);
                        expect(div.width()).not.toBe(0);
                    });

                    waits(200);

                    runs(function () {
                        expect(div.height()).toBe(100);
                        expect(div.width()).toBe(100);
                        div.remove();
                    });
                });

                it("works for string props", function () {
                    var div = $("<div style='border:1px solid red;'>" +
                        "<div style='width:100px;height: 100px;'>" +
                        "</div>" +
                        "</div>").appendTo('body');

                    // width height 特殊，
                    // ie6 需要设置 overflow:hidden
                    // 否则动画不对
                    div.css({
                        opacity: 0
                    });
                    div.animate(" width: 0; opacity: 1;", {
                        duration: 0.2,
                        complete: function () {
                            div.remove();
                        }
                    });

                    waits(100);
                    runs(function () {
                        expect(parseInt(div.css('opacity'))).not.toBe(1);
                    });

                    waits(200);
                    runs(function () {
                        expect(parseInt(div.css('opacity'))).toBe(1);
                        div.remove();
                    });
                });

                it('support transform animation', function () {
                    var div = Dom.create('<div style="position: absolute;' +
                        'border:1px solid red;' +
                        'left:100px;' +
                        'top:100px;' +
                        'width: 100px;height: 100px;"></div>');
                    document.body.appendChild(div);

                    expect(Dom.css(div, 'transform')).toBe('none');
                    var val = 'rotate(30deg)';
                    var expectedMatrix = matrix(val);
                    var ok = 0;

                    new Anim(div, {
                        transform: val
                    }, {
                        duration: 1,
                        complete: function () {
                            ok = 1;
                        }
                    }).run();

                    waitsFor(function () {
                        return ok;
                    });

                    waits(199);

                    runs(function () {
                        expect(matrix(Dom.css(div, 'transform')))
                            .toBeAlmostEqualMatrix(expectedMatrix)
                    });

                    runs(function () {
                        Dom.remove(div);
                    });
                });
            });
        }};
}, {
    requires: ['dom', 'anim', 'node']
});