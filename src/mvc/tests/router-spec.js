KISSY.use('mvc', function(S, MVC) {

    var Model = MVC.Model,
        Collection = MVC.Collection,
        View = MVC.View,
        Router = MVC.Router;


    describe("router", function() {

        it("works", function() {

            location.hash = "";

            var ok = 0,
                ok2 = 0;
            var r = new Router({
                routes:{
                    "/list/*path":function(paths, query) {
                        expect(paths.path).toBe("what/item");
                        expect(query.item1).toBe("1");
                        expect(query.item2).toBe("2");
                        ok = 1;
                    },
                    "/detail/:id":function(paths, query) {
                        expect(paths.id).toBe("9999");
                        expect(query.item1).toBe("1");
                        expect(query.item2).toBe("2");
                        ok2 = 1;
                    }
                }
            });

            r.start();

            r.navigate("/list/what/item?item1=1&item2=2");

            setTimeout(function() {

                r.navigate("/detail/9999?item1=1&item2=2");
            }, 1000);

            waitsFor(function() {
                return ok && ok2;
            });
        });
    });

});