KISSY.add(function (S, Json) {
    /*global global*/
    var JSON = ((S.UA.nodejs && typeof global === 'object') ? global : S.Env.host).JSON;

    var phantomjs = S.UA.phantomjs;

    describe('json', function () {
        describe('stringify', function () {
            it('should escape " in property name and value', function () {
                var x = {
                    '"z"': '"q"'
                };
                var ret = Json.stringify(x);
                expect(ret).toBe('{"\\"z\\"":"\\"q\\""}');
                var obj = Json.parse(ret);
                ret = Json.stringify(obj);
                expect(ret).toBe('{"\\"z\\"":"\\"q\\""}');
            });

            it('should convert an arbitrary value to a Json string representation', function () {
                expect(Json.stringify({'a': true})).toBe('{"a":true}');
                expect(Json.stringify(true)).toBe('true');
                expect(Json.stringify(null)).toBe('null');
                // ie8 native json will be 'undefined'
                expect(Json.stringify(undefined)).toBe(undefined);
                expect(Json.stringify(NaN)).toBe('null');
                if (JSON) {
                    expect(Json.stringify({'a': true})).toBe(JSON.stringify({'a': true}));
                    expect(Json.stringify(true)).toBe(JSON.stringify(true));
                    expect(Json.stringify(null)).toBe(JSON.stringify(null));
                    // special number
                    expect(Json.stringify(NaN)).toBe(JSON.stringify(NaN));
                    expect(Json.stringify(Infinity)).toBe(JSON.stringify(Infinity));
                }
            });

            describe('indent', function () {
                it('string works for object', function () {
                    var gap = ' ';
                    var space = ' ';
                    var ret = Json.stringify({
                        'a': {
                            b: 1
                        }
                    }, null, gap);

                    expect(ret).toBe('{\n' +
                        gap +
                        '"a":' + space + '{\n' +
                        gap + gap + '"b":' + space + '1\n' +
                        gap + '}' +
                        '\n}');

                    if (JSON) {
                        expect(ret).toBe(JSON.stringify({
                            'a': {
                                b: 1
                            }
                        }, null, gap));
                    }
                });

                it('string works for array', function () {
                    var gap = ' ';
                    var space = ' ';

                    var ret = Json.stringify({
                        'a': [1]
                    }, null, gap);

                    expect(ret).toBe('{\n' +
                        gap +
                        '"a":' + space + '[\n' +
                        gap + gap + '1\n' +
                        gap + ']' +
                        '\n}');

                    if (JSON) {
                        expect(ret).toBe(JSON.stringify({
                            'a': [1]
                        }, null, gap));
                    }
                });

                it('number works for object', function () {
                    var gap = '  ';
                    var space = ' ';
                    var ret = Json.stringify({
                        'a': {
                            b: 1
                        }
                    }, null, 2);

                    expect(ret).toBe('{\n' +
                        gap +
                        '"a":' + space + '{\n' +
                        gap + gap + '"b":' + space + '1\n' +
                        gap + '}' +
                        '\n}');

                    if (JSON) {
                        expect(ret).toBe(JSON.stringify({
                            'a': {
                                b: 1
                            }
                        }, null, 2));
                    }
                });

                it('string works for array', function () {
                    var gap = '  ';
                    var space = ' ';

                    var ret = Json.stringify({
                        'a': [1]
                    }, null, 2);

                    expect(ret).toBe('{\n' +
                        gap +
                        '"a":' + space + '[\n' +
                        gap + gap + '1\n' +
                        gap + ']' +
                        '\n}');

                    if (JSON) {
                        expect(ret).toBe(JSON.stringify({
                            'a': [1]
                        }, null, 2));
                    }
                });
            });

            describe('replacer', function () {
                it('works for object', function () {
                    var gap = '  ';
                    var space = ' ';
                    var ret = Json.stringify({
                        'a': {
                            b: {
                                z: 1
                            }
                        }
                    }, function (key, value) {
                        if (key === 'b') {
                            expect(value.z).toBe(1);
                            return 1;
                        }
                        return value;
                    }, 2);

                    expect(ret).toBe('{\n' +
                        gap +
                        '"a":' + space + '{\n' +
                        gap + gap + '"b":' + space + '1\n' +
                        gap + '}' +
                        '\n}');

                    if (JSON) {
                        expect(ret).toBe(JSON.stringify({
                            'a': {
                                b: {
                                    z: 1
                                }
                            }
                        }, function (key, value) {
                            if (key === 'b') {
                                expect(value.z).toBe(1);
                                return 1;
                            }
                            return value;
                        }, 2));
                    }
                });

                if (JSON && !phantomjs) {
                    it('string works for array', function () {
                        var gap = '  ';
                        var space = ' ';

                        var ret = Json.stringify({
                            'a': [
                                {
                                    z: 1
                                }
                            ]
                        }, function (key, value) {
                            if (key === '0') {
                                expect(value.z).toBe(1);
                                return 1;
                            }
                            return value;
                        }, 2);

                        expect(ret).toBe('{\n' +
                            gap +
                            '"a":' + space + '[\n' +
                            gap + gap + '1\n' +
                            gap + ']' +
                            '\n}');


                        expect(ret).toBe(JSON.stringify({
                            'a': [
                                {
                                    z: 1
                                }
                            ]
                        }, function (key, value) {
                            // ie8 will be int
                            if (String(key) === '0') {
                                expect(value.z).toBe(1);
                                return 1;
                            }
                            return value;
                        }, 2));
                    });
                }
            });
        });

        describe('parse', function () {
            it('allow whitespace', function () {
                var t = '{"test": 1,"t":2}',
                    r = {test: 1, t: 2};
                expect(Json.parse(t)).toEqual(r);
                if (JSON) {
                    expect(JSON.parse(t)).toEqual(r);
                }
            });

            it('works for array', function () {
                var t = '{"test":["t1","t2"]}',
                    r = {test: ['t1', 't2']};
                expect(Json.parse(t)).toEqual(r);
                if (JSON) {
                    expect(JSON.parse(t)).toEqual(r);
                }
            });

            it('should throw exception when encounter non-whitespace', function () {
                var t = '{"x": x"2"}';
                expect(function () {
                    Json.parse(t);
                }).toThrow();
                if (JSON) {
                    expect(function () {
                        JSON.parse(t);
                    }).toThrow();
                }
            });

            it('should parse a Json string to the native JavaScript representation', function () {
                var r, t;
                expect(Json.parse(t = '{"test":1}')).toEqual(r = {test: 1});
                if (JSON) {
                    expect(JSON.parse(t)).toEqual(r);
                }
                expect(Json.parse(t = '{}')).toEqual(r = {});
                if (JSON) {
                    expect(JSON.parse(t)).toEqual(r);
                }
                expect(Json.parse(t = '\n{"test":1}')).toEqual(r = {test: 1}); // 去除空白
                if (JSON) {
                    expect(JSON.parse(t)).toEqual(r);
                }
                expect(Json.parse(t = null)).toBeNull(r = null);
                if (JSON) {
                    expect(JSON.parse(t)).toEqual(r);
                }
                expect(Json.parse(t = 'true')).toBe(r = true);
                if (JSON) {
                    expect(JSON.parse(t)).toEqual(r);
                }
                expect(Json.parse(t = true)).toBe(r = true);
                if (JSON) {
                    expect(JSON.parse(t)).toEqual(r);
                }
                expect(Json.parse(t = 'null')).toBe(r = null);
                if (JSON) {
                    expect(JSON.parse(t)).toEqual(r);
                }
                expect(
                    function () {
                        Json.parse(t = '{a:1}');
                    }).toThrow();
                if (JSON) {
                    expect(
                        function () {
                            Json.parse(t);
                        }).toThrow();
                }
            });

            it('reviver works', function () {
                var t, f, r;
                expect(Json.parse(t = '{"test": 1,"t":2}', f = function (key, v) {
                    if (key === 't') {
                        return v + 1;
                    }
                    return v;
                })).toEqual(r = {test: 1, t: 3});
                if (JSON) {
                    expect(JSON.parse(t, f)).toEqual(r);
                }

                expect(Json.parse(t = '{"test": 1,"t":2}', f = function (key, v) {
                    if (key === 't') {
                        return undefined;
                    }
                    return v;
                })).toEqual(r = {test: 1});
                if (JSON) {
                    expect(JSON.parse(t, f)).toEqual(r);
                }

                expect(Json.parse(t = '{"test": {"t":{ "t3":4},"t2":4}}', f = function (key, v) {
                    if (key === 't') {
                        return 1;
                    }
                    if (key === 't2') {
                        return v + 1;
                    }
                    return v;
                })).toEqual(r = {test: {
                        t: 1,
                        t2: 5
                    }});
                if (JSON) {
                    expect(JSON.parse(t, f)).toEqual(r);
                }
            });

            // phantomjs allow \t
            it('should throw exception when encounter control character', function () {
                var t;
                expect(function () {
                    Json.parse(t = '{"x":"\t"}');
                }).toThrow();
                if (JSON && !phantomjs) {
                    expect(
                        function () {
                            Json.parse(t);
                        }).toThrow();
                }
            });
        });
    });
}, {
    requires: ['json']
});
