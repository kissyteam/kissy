KISSY.use('mvc', function(S, MVC) {

    var Model = MVC.Model,
        Collection = MVC.Collection,
        View = MVC.View,
        Router = MVC.Router;


    describe("router", function() {

        it("works", function() {


            var ok = 0,
                ok2 = 0;
            var r = new Router({
                routes:{
                    "/list/*path":function(paths, query) {
                        expect(paths.path).toBe("what/item");
                        expect(query.item1).toBe("1");
                        expect(query.item2).toBe("2");
                        ok ++;
                    },
                    "/detail/:id":function(paths, query) {
                        expect(paths.id).toBe("9999");
                        expect(query.item1).toBe("1");
                        expect(query.item2).toBe("2");
                        ok2 ++;
                    }
                }
            });

            r.start({
                success:function() {
                    r.navigate("/list/what/item?item1=1&item2=2");
                }
            });


            waits(1000);

            runs(function() {
                r.navigate("/detail/9999?item1=1&item2=2");
            });

            waits(4000);

            runs(function() {
                expect(ok).toBe(1);
                expect(ok2).toBe(1);
            });
        });
    });

});