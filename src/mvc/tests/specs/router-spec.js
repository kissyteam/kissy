KISSY.use('mvc,event', function(S, MVC, Event) {

    var Model = MVC.Model,
        Collection = MVC.Collection,
        View = MVC.View,
        Router = MVC.Router;


    describe("router", function() {

        it("works", function() {

            //document.domain='ali.com';

            var ok = 0,
                ok3 = 0,
                ok4 = 0,
                ok2 = 0;

            var r = new Router({
                routes:{
                    "/*path":function(paths) {
                        expect(paths.path).toBe("haha/hah2/hah3");
                        ok3++;
                    },
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
                    },
                    "reg_test":{
                        reg:'^/list-(\\w)$',
                        callback:function(paths) {
                            expect(arguments.length).toBe(2);
                            expect(paths[0]).toBe('t');
                            ok4++;
                        }
                    }

                }
            });

            // restore hash to its original value
            location.hash = '';

            Router.start({
                success:function() {
                    Router.navigate("/list/what/item?item1=1&item2=2");
                }
            });

            waits(200);

            runs(function() {
                Router.navigate("/list/what/item?item1=1&item2=2");
            });

            waits(200);

            runs(function() {
                Router.navigate("/detail/9999?item1=1&item2=2");
            });

            waits(200);

            runs(function() {
                Router.navigate("/haha/hah2/hah3");
            });

            waits(200);

            runs(function() {
                Router.navigate("/list-t");
            });

            waits(200);

            runs(function() {
                expect(ok).toBe(1);
                expect(ok2).toBe(1);
                expect(ok3).toBe(1);
                expect(ok4).toBe(1);
            });
        });
    });

});