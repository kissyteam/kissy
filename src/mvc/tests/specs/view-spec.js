/**
 * View spec for mvc
 * @author yiminghe@gmail.com
 */
KISSY.use("node,mvc", function (S, Node, MVC) {

    var Model = MVC.Model,
        $ = Node.all,
        Collection = MVC.Collection,
        View = MVC.View,
        Router = MVC.Router;

    describe("view", function () {

        it("create works", function () {

            var v = new View({
                el:"<span />"
            });

            expect(v.get("el")[0].nodeName.toLowerCase()).toBe("span");

        });

        it("delegate works", function () {
            var click = 0,
                click2 = 0,
                v = new View({
                    events:{
                        ".x":{
                            click:function (e) {
                                click = $(e.currentTarget).html();
                            }
                        },
                        ".y":{
                            click:function (e) {
                                click2 = $(e.currentTarget).html();
                            }
                        }
                    }
                });


            var c = v.get("el");

            c.html("<span class='x'>1</span><span class='y'>2</span>").appendTo("body");

            var x = c.one(".x"),
                y = c.one(".y");

            jasmine.simulate(x[0], "click");
            jasmine.simulate(y[0], "click");

            waitsFor(function () {
                return click === "1" && click2 === "2";
            });

            runs(function () {
                c.remove();
            });
        });

    });

});