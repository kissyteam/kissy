/**
 * tc about event group support
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, Dom, Node) {

    var $ = Node.all,
    // simulate mouse event on any element
        simulate = function (target, type, relatedTarget) {
            target = Dom.get(target);
            jasmine.simulate(target, type, { relatedTarget: relatedTarget });
        };

    describe("native event group", function () {

        describe("native fire", function () {

            var t;

            beforeEach(function () {
                t = $("<div id='d-event-group'><div id='c-event-group'>click</div></div>").appendTo(document.body);
            });

            afterEach(function () {
                t.remove();
            });

            it("should works with one group simply", function () {
                var g = t.one("#c-event-group"),
                    ret = [];
                t.on('click', function () {
                    ret.push(3);
                });
                // 同时属于 one 和 two 组
                g.on("click.one.two", function () {
                    ret.push(1);
                });
                g.on('click.two', function () {
                    ret.push(2);
                });
                // 只删去属于 two 组的 click handler
                g.detach("click.two");
                simulate(g, 'click');
                waits(100);
                runs(function () {
                    expect(ret).toEqual([3]);
                });
            });

            it("should works with multiple events", function () {
                var g = t.one("#c-event-group"),
                    ret = [];
                t.on('click', function () {
                    ret.push(3);
                });
                g.on("click.one.two click.two", function (e) {
                    expect(e.type).toBe('click');
                    ret.push(1);
                });

                g.detach("click.two");
                simulate(g, 'click');
                waits(100);
                runs(function () {
                    expect(ret).toEqual([3]);
                });
            });

            it("should works with multiple events when remove", function () {
                var g = t.one("#c-event-group"),
                    ret = [];
                t.on('click', function () {
                    ret.push(3);
                });
                g.on("click.one click.two", function (e) {
                    expect(e.type).toBe('click');
                    ret.push(1);
                });
                // 删除 two 组和 one 组 的 click handler
                g.detach("click.two click.one");
                simulate(g, 'click');
                waits(100);
                runs(function () {
                    expect(ret).toEqual([3]);
                });
            });

            it("should works with multiple events and no type when remove", function () {
                var g = t.one("#c-event-group"),
                    ret = [];
                t.on('click', function () {
                    ret.push(3);
                });
                g.on("click.one click.two", function (e) {
                    expect(e.type).toBe('click');
                    ret.push(1);
                });
                // 删除所有事件的 two 组和 one 组
                g.detach(".two .one");
                simulate(g, 'click');
                waits(100);
                runs(function () {
                    expect(ret).toEqual([3]);
                });
            });

            it("should works with multiple events and groups by simulate", function () {
                var g = t.one("#c-event-group"),
                    ret = [];
                t.on('click', function () {
                    ret.push(3);
                });
                g.on("click.one.two click.two", function (e) {
                    expect(e.type).toBe('click');
                    ret.push(1);
                });
                // 删除既属于 two 组又属于 one 组的所有事件的 handler
                g.detach(".two.one");
                simulate(g, 'click');
                waits(100);
                runs(function () {
                    expect(ret).toEqual([1, 3]);
                });
            });

            it("should works multiple groups", function () {
                var g = t.one("#c-event-group"),
                    ret = [];
                t.on('click', function () {
                    ret.push(3);
                });
                g.on("click.one.two", function () {
                    ret.push(1);
                });
                g.on('click.two', function () {
                    ret.push(2);
                });

                g.detach("click.one");
                simulate(g, 'click');
                waits(100);
                runs(function () {
                    expect(ret).toEqual([2, 3]);
                });
            });

        });

        describe("fire manually", function () {
            var t;

            beforeEach(function () {
                t = $("<div id='d-event-group'><div id='c-event-group'>click</div></div>").appendTo(document.body);
            });

            afterEach(function () {
                t.remove();
            });

            it("should works with one group simply", function () {
                var g = t.one("#c-event-group"),
                    ret = [];
                t.on('click', function () {
                    ret.push(3);
                });
                // 同时属于 one 和 two 组
                g.on("click.one.two", function () {
                    ret.push(1);
                });
                g.on('click.two', function () {
                    ret.push(2);
                });
                // 只删去属于 two 组的 click handler
                g.detach("click.two");
                g.fire('click');
                runs(function () {
                    expect(ret).toEqual([3]);
                });
            });

            it("should fire", function () {
                var g = t.one("#c-event-group"),
                    ret = [];
                t.on('click', function () {
                    ret.push(3);
                });
                // 同时属于 one 和 two 组
                g.on("click.one.two", function () {
                    ret.push(1);
                });
                g.on('click.two', function () {
                    ret.push(2);
                });
                g.fire('click');
                expect(ret).toEqual([1, 2, 3]);

            });

            it("should fire at specified groups 1", function () {
                var g = t.one("#c-event-group"),
                    ret = [];
                t.on('click', function () {
                    ret.push(3);
                });
                // 同时属于 one 和 two 组
                g.on("click.one.two", function () {
                    ret.push(1);
                });
                g.on('click.two', function () {
                    ret.push(2);
                });
                // 触发第二组事件
                g.fire("click.two");
                expect(ret).toEqual([1, 2]);
            });

            it("should fire at specified groups 2", function () {
                var g = t.one("#c-event-group"),
                    ret = [];
                t.on('click', function () {
                    ret.push(3);
                });
                // 同时属于 one 和 two 组
                g.on("click.one.two", function () {
                    ret.push(1);
                });
                g.on('click.two', function () {
                    ret.push(2);
                });
                // 触发第一组的事件
                g.fire("click.one");
                expect(ret).toEqual([1]);
            });

            it("should fire at specified groups 3", function () {
                var g = t.one("#c-event-group"),
                    ret = [];
                t.on('click', function () {
                    ret.push(3);
                });
                // 同时属于 one 和 two 组
                g.on("click.one.two", function () {
                    ret.push(1);
                });
                g.on('click.two', function () {
                    ret.push(2);
                });
                g.on('click.one', function () {
                    ret.push(3);
                });
                // 触发同时属于 one 和 two 组的 handler
                g.fire("click.one.two");
                expect(ret).toEqual([1]);
            });

            it("should works with multiple events", function () {
                var g = t.one("#c-event-group"),
                    ret = [];
                t.on('click', function () {
                    ret.push(3);
                });
                g.on("click.one.two click.two", function (e) {
                    expect(e.type).toBe('click');
                    ret.push(1);
                });

                g.detach("click.two");
                g.fire('click');
                runs(function () {
                    expect(ret).toEqual([3]);
                });
            });

            it("should works with multiple events when remove", function () {
                var g = t.one("#c-event-group"),
                    ret = [];
                t.on('click', function () {
                    ret.push(3);
                });
                g.on("click.one click.two", function (e) {
                    expect(e.type).toBe('click');
                    ret.push(1);
                });
                // 删除 two 组和 one 组 的 click handler
                g.detach("click.two click.one");
                g.fire('click');
                runs(function () {
                    expect(ret).toEqual([3]);
                });
            });

            it("should works with multiple events and no type when remove", function () {
                var g = t.one("#c-event-group"),
                    ret = [];
                t.on('click', function () {
                    ret.push(3);
                });
                g.on("click.one click.two", function (e) {
                    expect(e.type).toBe('click');
                    ret.push(1);
                });
                // 删除所有事件的 two 组和 one 组
                g.detach(".two .one");
                g.fire('click');
                runs(function () {
                    expect(ret).toEqual([3]);
                });
            });

            it("should works with multiple events and groups by fire", function () {
                var g = t.one("#c-event-group"),
                    ret = [];
                t.on('click', function () {
                    ret.push(3);
                });
                g.on("click.one.two click.two", function (e) {
                    expect(e.type).toBe('click');
                    ret.push(1);
                });
                // 删除既属于 two 组又属于 one 组的所有事件的 handler
                g.detach(".two.one");
                g.fire('click');
                runs(function () {
                    expect(ret).toEqual([1, 3]);
                });
            });

            it("should works multiple groups", function () {
                var g = t.one("#c-event-group"),
                    ret = [];
                t.on('click', function () {
                    ret.push(3);
                });
                g.on("click.one.two", function () {
                    ret.push(1);
                });
                g.on('click.two', function () {
                    ret.push(2);
                });

                g.detach("click.one");
                g.fire('click');
                runs(function () {
                    expect(ret).toEqual([2, 3]);
                });
            });
        });
    });

},{
    requires:['dom','node']
});