/*jshint quotmark:false*/
describe("timestamp for individual module works in combine mode", function () {
    var S = KISSY;
    var host = location.host;

    beforeEach(function () {
        window.TIMESTAMP_X = 0;
        S.config('combine', true);
    });

    afterEach(function () {
        S.clearLoader();
        try {
            delete window.TIMESTAMP_X;
        } catch (e) {
            window.TIMESTAMP_X = undefined;
        }
    });

    it("works theoretically", function () {
        KISSY.config({
            base: '',
            tag: '',
            debug: true,
            packages: {
                'timestamp': {
                    tag: 'a',
                    base: '/kissy/src/loader/tests/specs/timestamp'
                }
            },
            modules: {
                'timestamp/x': {
                    requires: ['./z']
                },
                'timestamp/y': {
                    requires: ['./x']
                },
                'timestamp/z': {
                    tag: 'z'
                }
            }
        });

        var loader = new S.Loader.ComboLoader();

        var allMods = loader.calculate((["timestamp/y"]));

        var comboUrls = loader.getComboUrls(allMods);

        expect(comboUrls.js[0].url)
            .toBe("http://" + host +
                "/kissy/src/loader/tests/specs/timestamp/??y.js,x.js,z.js?t=a.js");

    });

    it("works practically", function () {
        window.TIMESTAMP_X = 0;
        KISSY.config({
            base: '',
            tag: '',
            debug: true,
            packages: {
                'timestamp': {
                    tag: 'a',
                    base: '/kissy/src/loader/tests/specs/timestamp'
                }
            },
            modules: {
                'timestamp/x': {
                    tag: 'b',
                    requires: ['./z']
                },
                'timestamp/y': {
                    requires: ['./x']
                },
                'timestamp/z': {
                    tag: 'z'
                }
            }
        });

        var ok = 0;

        S.use('timestamp/y', function (S, Y) {
            expect(Y).toBe(1);
            ok = 1;
        });

        waitsFor(function () {
            return ok;
        });

    });


    it("works theoretically when package has no combo", function () {
        window.TIMESTAMP_X = 0;
        KISSY.config({
            base: '',
            tag: '',
            debug: true,
            packages: {
                'timestamp': {
                    combine: false,
                    tag: 'a',
                    base: '/kissy/src/loader/tests/specs/timestamp'
                }
            },
            modules: {
                'timestamp/x': {
                    tag: 'b',
                    requires: ['./z']
                },
                'timestamp/y': {
                    requires: ['./x']
                },
                'timestamp/z': {
                    tag: 'z'
                }
            }
        });

        var loader = new S.Loader.ComboLoader();

        var allMods = loader.calculate(["timestamp/y"]);

        var comboUrls = loader.getComboUrls(allMods);

        var jss = comboUrls.js;

        expect(jss[0].url).toBe("http://" + host + "/kissy/src/loader/tests/specs/timestamp/y.js?t=a.js");
        expect(jss[1].url).toBe("http://" + host + "/kissy/src/loader/tests/specs/timestamp/x.js?t=b.js");
        expect(jss[2].url).toBe("http://" + host + "/kissy/src/loader/tests/specs/timestamp/z.js?t=z.js");


    });

    it("works practically when package has no combo", function () {
        window.TIMESTAMP_X = 0;
        KISSY.config({
            base: '',
            tag: '',
            debug: true,
            packages: {
                'timestamp': {
                    combine: false,
                    tag: 'a',
                    base: '/kissy/src/loader/tests/specs/timestamp'
                }
            },
            modules: {
                'timestamp/x': {
                    tag: 'b',
                    requires: ['./z']
                },
                'timestamp/y': {
                    requires: ['./x']
                },
                'timestamp/z': {
                    tag: 'z'
                }
            }
        });

        var ok = 0;

        S.use('timestamp/y', function (S, Y) {
            expect(Y).toBe(1);
            ok = 1;
        });

        waitsFor(function () {
            return ok;
        });

    });
});
