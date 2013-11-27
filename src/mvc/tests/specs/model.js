/**
 * Model spec for mvc
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, MVC) {

    var Model = MVC.Model,
        View = MVC.View,
        Router = MVC.Router;


    describe("model", function () {

        it("load works", function () {
            var model = new Model({
                urlRoot:"../data/model/"
            });
            expect(model.isNew()).toBe(true);
            expect(model.isModified()).toBe(true);
            var ok = 0;
            model.load({
                success:function () {
                    expect(model.isNew()).toBe(false);
                    expect(model.isModified()).toBe(false);
                    expect(model.get('x')).toBe(1);
                    expect(model.get('y')).toBe(2);
                    expect(model.getId()).toBe(9);

                    model.set('x', 5);
                    expect(model.isNew()).toBe(false);
                    expect(model.isModified()).toBe(true);
                    ok = 1;
                }
            });

            waitsFor(function () {
                return ok;
            })

        });


        it("save works", function () {
            var model = new Model({
                urlRoot:"../data/model/"
            });
            expect(model.isNew()).toBe(true);
            expect(model.isModified()).toBe(true);
            var ok = 0, ok2 = 0;
            model.load({
                success:function () {
                    expect(model.isNew()).toBe(false);
                    expect(model.isModified()).toBe(false);
                    expect(model.get('x')).toBe(1);
                    expect(model.get('y')).toBe(2);
                    ok = 1;
                }
            });

            waitsFor(function () {
                return ok;
            });

            runs(function () {
                model.set('x', 5);
                expect(model.get('x')).toBe(5);
            });


            runs(function () {
                model.save({
                    success:function () {
                        expect(model.get('x')).toBe(5);
                        ok2 = 1;
                    }
                });
            });

            waitsFor(function () {
                return ok2;
            });

        });

        it("delete works", function () {
            var model = new Model({
                urlRoot:"../data/model/"
            });

            expect(model.isNew()).toBe(true);
            expect(model.isModified()).toBe(true);

            var ok = 0;

            model.load({
                success:function () {
                    expect(model.isNew()).toBe(false);
                    expect(model.isModified()).toBe(false);
                    expect(model.get('x')).toBe(1);
                    expect(model.get('y')).toBe(2);
                    expect(model.getId()).toBe(9);
                    ok = 1;
                }
            });

            waitsFor(function () {
                return ok;
            });

            var ok2 = 0;

            runs(function () {
                model.destroy({
                    "delete":true,
                    success:function () {
                        expect(model.getId()).toBe(-1);
                        ok2 = 1;
                    }
                });
            });

            waitsFor(function () {
                return ok2;
            });
        });

        describe("events", function () {

            it("should fire *Change", function () {
                var model = new Model();
                var afterChange = [];

                model.on("*Change", function (e) {
                    afterChange.push.apply(afterChange, e.attrName);
                });
                expect(model.isNew()).toBe(true);
                expect(model.isModified()).toBe(true);
                model.set('x', 1);
                model.set('y', 1);
                expect(afterChange).toEqual(['x', 'y']);
            });

        });
    });

},{
    requires:['mvc']
});