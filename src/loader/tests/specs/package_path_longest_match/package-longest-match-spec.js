/*jshint quotmark:false*/
// --no-module-wrap--
describe("loader package", function () {
    var S = KISSY;
    var Loader = S.Loader;
    beforeEach(function () {
        KISSY.config('combine', false);
    });

    afterEach(function () {
        KISSY.clearLoader();
    });
    it("longest match works", function () {
        var debug = S.Config.debug;
        S.Config.debug = true;
        S.config({
            packages: {
                test: {
                    base: "/kissy/src/loader/tests/specs/package_path_longest_match/test"
                },
                test2: {
                    base: "/kissy/src/loader/tests/specs/package_path_longest_match/test/test2"
                }
            }
        });

        var ret = 0;

        S.use("test2/a", function (S, A) {
            ret = A;
        });

        waitsFor(function () {
            return ret === 9;
        });

        runs(function () {
            S.Config.debug = debug;
        });
    });

    it('match by slash', function () {
        S.config({
            packages: {
                com: {
                    base: "/kissy/src/loader/tests/specs/package_path_longest_match/com"
                },
                "com/c": {
                    base: "/kissy/src/loader/tests/specs/package_path_longest_match/com/c"
                }
            }
        });

        var m1 = new Loader.Module({
            name: 'component',
            runtime: S
        });

        expect(m1.getPackage().name).toBe('core');


        m1 = new Loader.Module({
            name: 'component/a',
            runtime: S
        });

        expect(m1.getPackage().name).toBe('core');

        m1 = new Loader.Module({
            name: 'component/a/c',
            runtime: S
        });

        expect(m1.getPackage().name).toBe('core');

        m1 = new Loader.Module({
            name: 'com',
            runtime: S
        });

        expect(m1.getPackage().name).toBe('com');

        m1 = new Loader.Module({
            name: 'com/a',
            runtime: S
        });

        expect(m1.getPackage().name).toBe('com');

        m1 = new Loader.Module({
            name: 'com/a/a',
            runtime: S
        });

        expect(m1.getPackage().name).toBe('com');

        m1 = new Loader.Module({
            name: 'com/c',
            runtime: S
        });

        expect(m1.getPackage().name).toBe('com/c');

        m1 = new Loader.Module({
            name: 'com/c/a',
            runtime: S
        });

        expect(m1.getPackage().name).toBe('com/c');
    });
});