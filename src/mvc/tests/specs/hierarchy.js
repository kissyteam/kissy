/**
 * Usage model tc
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, mvc) {
    var Model = mvc.Model,
        Collection = mvc.Collection;

    var TreeNodeModel = Model.extend({
        getChildren: function () {
            return this.children || (this.children = new TreeNodeCollection());
        },
        toJSON: function () {
            var ret = this.callSuper(),
                children = this.getChildren().toJSON();
            if (children.length) {
                ret.children = children;
            }
            return ret;
        }
    }, {
        ATTRS: {
            children: {
                setter: function (vs) {
                    var mods = [];
                    for (var i = 0; i < vs.length; i++) {
                        var v = vs[i];
                        mods.push(new TreeNodeModel(v));
                    }
                    this.getChildren().set("models", mods);
                    return this.INVALID;
                }
            }
        }
    });

    var TreeNodeCollection = Collection.extend({}, {
        ATTRS: {
            model: {
                value: TreeNodeModel
            }
        }
    });

    describe("model hierachy", function () {

        var data = {
                title: "1",
                content: "1-1",
                children: [
                    {
                        title: "2",
                        content: "2-2",
                        children: [
                            {
                                title: "5",
                                content: "5-5"

                            },
                            {
                                title: "4",
                                content: "4-4"

                            }
                        ]
                    },
                    {
                        title: "3",
                        content: "3-3"
                    }
                ]
            },
            model = new TreeNodeModel(data);

        it("basic should works", function () {
            expect(model.get('title')).toBe("1");
            expect(model.get('content')).toBe("1-1");
            expect(model.get('children')).toBeUndefined();
        })

        it("children should be array of Model", function () {
            var children = model.children;

            expect(children.get("models").length).toBe(2);
            var c = children.get("models")[0],
                c2 = children.get("models")[1];
            expect(c2.get('title')).toBe("3");
            expect(c2.get('content')).toBe("3-3");
            expect(c.get('title')).toBe("2");
            expect(c.get('content')).toBe("2-2");
        });

        it("should construct collection recursively ", function () {
            var c = model.children.get("models")[0],
                children = c.children;
            expect(children.get("models").length).toBe(2);
            var c1 = children.get("models")[0],
                c2 = children.get("models")[1];
            expect(c1.get('title')).toBe("5");
            expect(c1.get('content')).toBe("5-5");

            expect(c2.get('title')).toBe("4");
            expect(c2.get('content')).toBe("4-4");
        });

        it("toJSON should equals to original data", function () {
            var d = model.toJSON();
            expect(d).toEqual(data);
        });
    });
}, {
    requires: ['mvc']
});