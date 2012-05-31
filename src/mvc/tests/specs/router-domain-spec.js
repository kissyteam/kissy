KISSY.use('mvc,event', function (S, MVC, Event) {

    var Model = MVC.Model,
        Collection = MVC.Collection,
        View = MVC.View,
        Router = MVC.Router;

    describe("domain in router", function () {

        it("change domain works", function () {

            var ok = 0;

            location.hash='';

            var r = new Router({
                routes:{
                    "/*path":function (paths) {
                        expect(paths.path).toBe("haha/hah2/hah3");
                        ok = 1;
                    }
                }
            });

            document.domain = 'ali.com';

            Router.start();

            waits(500);

            runs(function () {
                Router.navigate("/haha/hah2/hah3");
            });

            waits(500);

            runs(function () {
                expect(ok).toBe(1);
            });

        });

    });

});