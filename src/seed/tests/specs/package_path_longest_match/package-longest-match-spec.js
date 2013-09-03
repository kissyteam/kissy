describe("loader package", function () {
    var S = KISSY;
    var Loader = S.Loader;
    it("longest match works", function () {
        var debug = S.Config.debug;
        S.Config.debug = true;
        S.config({
            packages: [
                {
                    name: "test",
                    path: "/kissy/src/seed/tests/specs/package_path_longest_match/"
                },
                {
                    name: "test2",
                    path: "/kissy/src/seed/tests/specs/package_path_longest_match/test/"
                }
            ]
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
            S.clearLoader();
        });
    });

    it('match by slash', function () {
        S.config({
            packages: [
                {
                    name: "com",
                    path: "/kissy/src/seed/tests/specs/package_path_longest_match/"
                },
                {
                    name: "com/c",
                    path: "/kissy/src/seed/tests/specs/package_path_longest_match/"
                }
            ]
        });

        var m1 = new Loader.Module({
            name: 'component',
            runtime: S
        });

        expect(m1.getPackage().getName()).toBe('');

         m1 = new Loader.Module({
            name: 'component/a',
            runtime: S
        });

        expect(m1.getPackage().getName()).toBe('');

        m1 = new Loader.Module({
            name: 'component/a/c',
            runtime: S
        });

        expect(m1.getPackage().getName()).toBe('');

         m1 = new Loader.Module({
            name: 'com',
            runtime: S
        });

        expect(m1.getPackage().getName()).toBe('com');

        m1 = new Loader.Module({
            name: 'com/a',
            runtime: S
        });

        expect(m1.getPackage().getName()).toBe('com');

        m1 = new Loader.Module({
            name: 'com/a/a',
            runtime: S
        });

        expect(m1.getPackage().getName()).toBe('com');

        m1 = new Loader.Module({
            name: 'com/c',
            runtime: S
        });

        expect(m1.getPackage().getName()).toBe('com/c');

        m1 = new Loader.Module({
            name: 'com/c/a',
            runtime: S
        });

        expect(m1.getPackage().getName()).toBe('com/c');
    });
});