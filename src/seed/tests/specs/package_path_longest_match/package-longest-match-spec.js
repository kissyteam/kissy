describe("loader package", function () {

    it("longest match works", function () {

        var S = KISSY;

        var debug = S.Config.debug;
        S.Config.debug = true;
        KISSY.config({
            packages:[
                {
                    name:"test",
                    path:"/kissy/src/seed/tests/specs/package_path_longest_match/"
                },
                {
                    name:"test2",
                    path:"/kissy/src/seed/tests/specs/package_path_longest_match/test/"
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
        });

    });

});