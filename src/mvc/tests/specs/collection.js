/**
 * Collection spec for mvc
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, MVC) {

    var Model = MVC.Model,
        Collection = MVC.Collection,
        View = MVC.View,
        Router = MVC.Router;

    describe("collection", function () {

        it("create works", function () {
            var c = new Collection({
                url:"../data/collection/"
            }),
                ok = 0;

            c.create({
                x:11,
                y:22
            }, {
                success:function () {
                    expect(c.get("models").length).toBe(1);
                    var model = c.get("models")[0];
                    expect(model.get('x')).toBe(11);
                    expect(model.isNew()).toBe(false);
                    expect(model.isModified()).toBe(false);
                    model.set('x', 1);
                    expect(model.isModified()).toBe(true);
                    expect(model.isNew()).toBe(false);
                    expect(c.getById(9)).toBe(model);
                    expect(c.getByCid(model.get("clientId"))).toBe(model);
                    ok = 1;
                }
            });
            waitsFor(function () {
                return ok;
            });


        });


        it("load works", function () {
            var c = new Collection({
                url:"../data/collection/"
            }),
                ok = 0;

            c.load({
                success:function () {
                    expect(c.get("models").length).toBe(1);
                    var model = c.get("models")[0];
                    expect(model.get('x')).toBe(11);
                    expect(model.isNew()).toBe(false);
                    expect(model.isModified()).toBe(false);
                    model.set('x', 1);
                    expect(model.isModified()).toBe(true);
                    expect(model.isNew()).toBe(false);
                    expect(c.getById(9)).toBe(model);
                    expect(c.getByCid(model.get("clientId"))).toBe(model);
                    ok = 1;
                }
            });
            waitsFor(function () {
                return ok;
            });

        });

        it("model destroy works", function () {
            var c = new Collection({
                url:"../data/collection/"
            }),
                ok = 0;

            c.load({
                success:function () {
                    var model = c.get("models")[0];
                    model.destroy({
                        "delete":true,
                        success:function () {
                            expect(c.get("models").length).toBe(0);
                            ok = 1;
                        }
                    });
                }
            });
            waitsFor(function () {
                return ok;
            });
        });


        describe("events", function () {


            it("fire add/remove", function () {

                var c = new Collection(), add = 0, remove = 0, newModel, removeModel;

                c.on("add", function (e) {
                    add = 1;
                    newModel = e.model;
                });

                var model = c.add({x:1, y:1});

                c.on('remove', function (e) {
                    remove = 1;
                    removeModel = e.model;
                });

                c.remove(model);

                expect(add).toBe(1);
                expect(remove).toBe(1);

                expect(newModel).toBe(model);
                expect(removeModel).toBe(model);

                add = 0;
                remove = 0;

                var m = c.add({x:2}, {
                    silent:1
                });

                c.remove(m, {
                    silent:1
                });

                expect(add).toBe(0);
                expect(remove).toBe(0);
            });

            it("can capture change from its model", function () {
                var c = new Collection(),
                    called = 0,
                    m = c.add({
                        'x':1,
                        'y':1
                    });

                c.on("*Change", function (e) {
                    expect(e.target).toBe(m);
                    expect(e.prevVal).toEqual([1]);
                    expect(e.attrName).toEqual(['x']);
                    expect(e.newVal).toEqual([2]);
                    called = 1;
                });

                m.set('x', 2);

                waitsFor(function () {
                    return called;
                });
            });

        });

    });
},{
    requires:['mvc']
});