/**
 * custom bubble mechanism tc
 * @author yiminghe@gmail.com *
 */
KISSY.use("event/custom", function (S, Event) {

    var FIRST = '1', SECOND = '2', SEP = '=';

    describe("custom_event", function () {

        it("works for any object", function () {
            var r = 0;

            var x = S.mix({
                item: 1,
                length: 10
            }, S.EventTarget);

            x.on("my", function () {
                r = 1
            });
            x.fire("my");
            expect(r).toBe(1);
        });

        it('support once', function () {

            var ret = [],
                t = S.mix({}, Event.Target);

            t.on('click', {
                once: 1,
                fn: function () {
                    ret.push(1);
                }
            });

            t.on('click', {
                once: 1,
                fn: function () {
                    ret.push(2);
                }
            });

            t.fire('click');
            t.fire('click');

            expect(ret).toEqual([1,2]);

            expect(Event._ObservableCustomEvent
                .getCustomEvents(t)['click'].hasObserver())
                .toBeFalsy();
        });

        // note 219
        it('fire does not depend on custom event\'s type', function () {
            var S = KISSY,
                haha = 0,
                haha2 = 0,
                obj = S.mix({}, S.EventTarget);

            obj.on('haha', function (ev) {
                haha++;
                ev.type = 'hah3';
                obj.fire('haha2', ev);
            });

            obj.on('haha2', function () {
                haha2++;
            });

            obj.fire('haha');

            expect(haha).toBe(1);
            expect(haha2).toBe(1);

        });

        it("can fire more than one", function () {

            var args = [];

            function Test() {
                this.on("test", function (e) {
                    args.push(e.a);
                });
                this.on("test2", function (e) {
                    args.push(e.a);
                });
            }

            S.augment(Test, Event.Target);

            var t = new Test();

            t.fire("test test2", {
                a: 1
            });

            expect(args).toEqual([1, 1]);

        });

        describe('bubble', function () {
            it("can bubble", function () {

                var ret = [], args = [];

                function Test() {
                    this.on("test", function (e) {
                        ret.push(this.id);
                        args.push(e.a);
                        e.a++;
                    });
                }

                S.augment(Test, Event.Target);

                var t = new Test();

                t.id = 1;

                var t2 = new Test();

                t2.id = 2;

                t2.addTarget(t);


                t2.fire("test", {
                    a: 1
                });

                expect(ret).toEqual([2, 1]);
                expect(args).toEqual([1, 2]);

                ret = [];
                args = [];

                t2.removeTarget(t);

                t2.fire("test", {
                    a: 1
                });

                expect(ret).toEqual([2]);
                expect(args).toEqual([1]);

            });

            it('can bubble default', function () {

                var a = S.mix({}, Event.Target),
                    c = S.mix({}, Event.Target),
                    b = S.mix({}, Event.Target);
                a.id = 'a';
                b.id = 'b';
                c.id = 'c';
                var ret = [];
                a.addTarget(b);
                b.addTarget(c);

                c.on('click', function (e) {
                    ret.push(e.target.id);
                    ret.push(e.type);
                    ret.push(e.currentTarget.id);
                });

                a.fire('click');

                expect(ret).toEqual(['a', 'click', 'c']);

            });

            it("can stop bubble by stopPropagation()", function () {
                var ret = [];

                function Test() {

                    this.on("test", function (e) {
                        ret.push(this.id);
                        e.stopPropagation();
                    });
                }

                S.augment(Test, Event.Target);

                var t = new Test();

                t.id = 1;


                var t2 = new Test();

                t2.id = 2;

                t2.addTarget(t);

                t2.fire("test");

                expect(ret).toEqual([2]);
            });

            // deprecated!!
            it("can stop bubble by return false", function () {
                var ret = [];

                function Test() {
                    this.on("test", function () {
                        ret.push(this.id);
                        return false;
                    });
                }

                S.augment(Test, Event.Target);

                var t = new Test();

                t.id = 1;


                var t2 = new Test();

                t2.id = 2;

                t2.addTarget(t);

                t2.fire("test");

                expect(ret).toEqual([2]);
            });


            it("can bubble more than one level", function () {

                var r1 = S.mix({}, S.EventTarget);

                var r2 = S.mix({}, S.EventTarget);

                var r3 = S.mix({}, S.EventTarget);

                r2.addTarget(r1);
                r3.addTarget(r2);

                var ret = 0;

                r1.on("click", function () {
                    ret = 1;
                });

                r3.fire("click");

                expect(ret).toBe(1);

            });


            it("can not bubble if middle level does not allow", function () {

                var r1 = S.mix({}, S.EventTarget);

                var r2 = S.mix({}, S.EventTarget);

                var r3 = S.mix({}, S.EventTarget);

                r2.addTarget(r1);
                r3.addTarget(r2);

                r2.publish('click', {
                    bubbles: false
                });

                var ret = 0;

                r1.on("click", function () {
                    ret = 1;
                });

                r3.fire("click");

                expect(ret).toBe(0);

            });
        });


        it('should no memory leak for custom event', function () {

            var eventTarget = S.mix({}, Event.Target),
                i,
                noop = function () {
                },
                noop2 = function () {
                },
                noop3 = function () {
                };
            eventTarget.on("click", noop);
            eventTarget.on("click", noop2);
            eventTarget.on("click", noop3);
            eventTarget.on("keydown", noop);
            (function () {
                var events = Event._ObservableCustomEvent.
                    getCustomEvents(eventTarget);

                var num = 0;
                for (i in events) {
                    expect(S.inArray(i, ["click", "keydown"]))
                        .toBe(true);
                    num++;
                }
                expect(num).toBe(2);
                var clickObserver = events["click"];
                expect(clickObserver.observers.length).toBe(3);
            })();

            eventTarget.detach("click", noop);

            (function () {
                var events = Event._ObservableCustomEvent
                    .getCustomEvents(eventTarget);
                var num = 0;

                for (i in events) {

                    expect(S.inArray(i, ["click", "keydown"]))
                        .toBe(true);
                    num++;

                }
                expect(num).toBe(2);
                var clickObserver = events["click"];
                expect(clickObserver.observers.length).toBe(2);
            })();

            eventTarget.detach("click");

            (function () {
                var events = Event._ObservableCustomEvent.getCustomEvents(eventTarget);

                expect(events['keydown'].hasObserver()).toBeTruthy();
                var clickObserver = events["click"];
                expect(clickObserver.hasObserver()).toBeFalsy();
            })();

            eventTarget.detach();

            (function () {
                var events = Event._ObservableCustomEvent
                    .getCustomEvents(eventTarget);
                for(var o in events){
                    expect(events[o].hasObserver()).toBeFalsy();
                }

            })();
        });


        describe('fire', function () {


            it('get fire value', function () {

                var SPEED = '70 km/h', NAME = 'Lady Gogo', dog;

                function Dog(name) {
                    this.name = name;
                }

                S.augment(Dog, Event.Target, {
                    run: function () {
                        return this.fire('running', {speed: SPEED});
                    }
                });

                dog = new Dog(NAME);

                dog.on('running', function (ev) {
                    result.push(this.name);
                    result.push(ev.speed);
                    return this.name;
                });

                function rfalse() {
                    result.push(FIRST);
                    return false;
                }

                dog.on('running', rfalse);

                function f() {
                    result.push(SECOND);
                    return  SECOND;
                }

                dog.on('running', f);

                // let dog run
                var result = [];

                //有一个为 false 就是 false
                expect(dog.run()).toBe(false);
                waits(0);
                runs(function () {
                    expect(result.join(SEP)).toEqual([NAME, SPEED, FIRST, SECOND].join(SEP));
                });

                // test detach
                runs(function () {
                    result = [];
                    dog.detach('running', rfalse);

                    // 没有 false，就取最后的值
                    expect(dog.run()).toBe(SECOND);
                    waits(0);
                    runs(function () {
                        expect(result.join(SEP)).toEqual([NAME, SPEED, SECOND].join(SEP));
                    });
                });
            });

            it('can get defaultFn value as final value', function () {
                var o = S.mix({}, S.EventTarget);

                o.publish('t', {
                    defaultFn: function () {
                        return 'x';
                    }
                });

                o.on('t', function () {
                    return 'y';
                });

                expect(o.fire('t')).toBe('x');
            });

            describe("fire manually for event groups", function () {

                function Target() {

                }

                S.augment(Target, Event.Target);

                it("should works with one group simply", function () {

                    var g = new Target(), ret = [];
                    // 同时属于 one 和 two 组
                    g.on("click.one.two", function () {
                        ret.push(1);
                    });
                    g.on('click.two', function () {
                        ret.push(2);
                    });
                    // 只删去属于 two 组的 click handler
                    g.detach("click.two");
                    g.fire("click");
                    runs(function () {
                        expect(ret).toEqual([]);
                    });
                });

                it("should fire", function () {
                    var g = new Target(), ret = [];
                    // 同时属于 one 和 two 组
                    g.on("click.one.two", function () {
                        ret.push(1);
                    });
                    g.on('click.two', function () {
                        ret.push(2);
                    });
                    g.fire("click");
                    expect(ret).toEqual([1, 2]);

                });

                it("should fire at specified groups 1", function () {
                    var g = new Target(), ret = [];
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
                    var g = new Target(), ret = [];
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
                    var g = new Target(), ret = [];
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
                    var g = new Target(), ret = [];
                    g.on("click.one.two click.two", function (e) {
                        expect(e.type).toBe("click");
                        ret.push(1);
                    });
                    g.detach("click.two");
                    g.fire("click");
                    runs(function () {
                        expect(ret).toEqual([]);
                    });
                });

                it("should works with multiple events when remove", function () {
                    var g = new Target(), ret = [];
                    g.on("click.one click.two", function (e) {
                        expect(e.type).toBe("click");
                        ret.push(1);
                    });
                    // 删除 two 组和 one 组 的 click handler
                    g.detach("click.two click.one");
                    g.fire("click");
                    runs(function () {
                        expect(ret).toEqual([]);
                    });
                });

                it("should works with multiple events and no type when remove", function () {
                    var g = new Target(), ret = [];
                    g.on("click.one click.two", function (e) {
                        expect(e.type).toBe("click");
                        ret.push(1);
                    });
                    // 删除所有事件的 two 组和 one 组
                    g.detach(".two .one");
                    g.fire("click");
                    runs(function () {
                        expect(ret).toEqual([]);
                    });
                });

                it("should works with multiple events and groups", function () {
                    var g = new Target(), ret = [];
                    g.on("click.one.two click.two", function (e) {
                        expect(e.type).toBe("click");
                        ret.push(1);
                    });
                    // 删除既属于 two 组又属于 one 组的所有事件的 handler
                    g.detach(".two.one");
                    g.fire("click");
                    runs(function () {
                        expect(ret).toEqual([1]);
                    });
                });

                it("should works multiple groups", function () {
                    var g = new Target(), ret = [];
                    g.on("click.one.two", function () {
                        ret.push(1);
                    });
                    g.on('click.two', function () {
                        ret.push(2);
                    });

                    g.detach("click.one");
                    g.fire("click");
                    runs(function () {
                        expect(ret).toEqual([2]);
                    });
                });
            });

            describe("defaultFn", function () {

                it('support simple defaultFn', function () {
                    var ret = [],
                        t = S.mix({}, Event.Target);

                    t.publish('click', {
                        defaultFn: function (e) {
                            ret.push(e.dataX);
                        }
                    });

                    t.fire('click', {
                        dataX: 1
                    });

                    expect(ret).toEqual([1]);
                });


                it('support simple defaultFn with listeners', function () {
                    var ret = [],
                        t = S.mix({}, Event.Target);

                    t.publish('click', {
                        defaultFn: function () {
                            ret.push('1');
                        }
                    });

                    t.publish('clickWithDefault', {
                        defaultFn: function () {
                            ret.push('2');
                        }
                    });

                    t.on('click', function (e) {
                        ret.push('3:' + e.data);
                        e.preventDefault();
                    });

                    t.on('clickWithDefault', function (e) {
                        ret.push('4:' + e.data);

                    });

                    t.fire('click', {
                        data: 1
                    });

                    t.fire('clickWithDefault', {
                        data: 2
                    });

                    expect(ret).toEqual(['3:1', '4:2', '2'])
                });


            });


        });
    });

});