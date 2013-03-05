KISSY.use("json", function (S, JSON) {

    var J = window.JSON;

    describe('json', function () {
        describe('stringify', function () {
            it('should convert an arbitrary value to a JSON string representation', function () {
                expect(JSON.stringify({'a': true})).toBe('{"a":true}');

                expect(JSON.stringify(true)).toBe('true');

                expect(JSON.stringify(null)).toBe('null');
                expect(JSON.stringify(undefined)).toBe(undefined);
                expect(JSON.stringify(NaN)).toBe('null');


                expect(JSON.stringify({'a': true})).toBe(J.stringify({'a': true}));

                expect(JSON.stringify(true)).toBe(J.stringify(true));

                expect(JSON.stringify(null)).toBe(J.stringify(null));
                expect(JSON.stringify(undefined)).toBe(J.stringify(undefined));
                expect(JSON.stringify(NaN)).toBe(J.stringify(NaN));
            });

            describe('indent', function () {
                it('string works for object', function () {

                    var gap = ' ';
                    var space = ' ';
                    var ret = JSON.stringify({
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

                    expect(ret).toBe(J.stringify({
                        'a': {
                            b: 1
                        }
                    }, null, gap));
                });


                it('string works for array', function () {

                    var gap = ' ';
                    var space = ' ';

                    var ret = JSON.stringify({
                        'a': [1]
                    }, null, gap);

                    expect(ret).toBe('{\n' +
                        gap +
                        '"a":' + space + '[\n' +
                        gap + gap + '1\n' +
                        gap + ']' +
                        '\n}');

                    expect(ret).toBe(J.stringify({
                        'a': [1]
                    }, null, gap));
                });


                it('number works for object', function () {

                    var gap = '  ';
                    var space = ' ';
                    var ret = JSON.stringify({
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

                    expect(ret).toBe(J.stringify({
                        'a': {
                            b: 1
                        }
                    }, null, 2));
                });


                it('string works for array', function () {

                    var gap = '  ';
                    var space = ' ';

                    var ret = JSON.stringify({
                        'a': [1]
                    }, null, 2);

                    expect(ret).toBe('{\n' +
                        gap +
                        '"a":' + space + '[\n' +
                        gap + gap + '1\n' +
                        gap + ']' +
                        '\n}');

                    expect(ret).toBe(J.stringify({
                        'a': [1]
                    }, null, 2));

                });
            });


            describe('replacer', function () {
                it('works for object', function () {
                    var gap = '  ';
                    var space = ' ';
                    var ret = JSON.stringify({
                        'a': {
                            b: {
                                z: 1
                            }
                        }
                    }, function (key, value) {
                        if (key == 'b') {
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

                    expect(ret).toBe(J.stringify({
                        'a': {
                            b: {
                                z: 1
                            }
                        }
                    }, function (key, value) {
                        if (key == 'b') {
                            expect(value.z).toBe(1);
                            return 1;
                        }
                        return value;
                    }, 2));
                });


                it('string works for array', function () {

                    var gap = '  ';
                    var space = ' ';

                    var ret = JSON.stringify({
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

                    expect(ret).toBe(J.stringify({
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
                    }, 2));
                });
            });
        });

        describe('parse', function () {

            it('should parse a JSON string to the native JavaScript representation', function () {

                debugger
                expect(JSON.parse('{"test":1}')).toEqual({test: 1});
                expect(JSON.parse('{}')).toEqual({});
                expect(JSON.parse('\n{"test":1}')).toEqual({test: 1}); // 去除空白

                expect(JSON.parse()).toBeNull();
                expect(JSON.parse(null)).toBeNull();
                expect(JSON.parse('')).toBeNull();

                expect(JSON.parse('true')).toBe(true);
                expect(JSON.parse(true)).toBe(true);
                expect(JSON.parse('null')).toBe(null);

                expect(
                    function () {
                        JSON.parse('{a:1}');
                    }).toThrow();

            });

            // phantomjs allow \t
            it('should throw exception when encounter \\t', function () {
                expect(function () {
                    JSON.parse('{"x":"\t"}');
                }).toThrow();
            });

        });
    });

});
